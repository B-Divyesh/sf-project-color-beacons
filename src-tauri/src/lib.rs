use serde::Deserialize;
use serde_json::{json, Map, Value};
use std::{fs, path::{Path, PathBuf}};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Project {
    name: String,
    path: String,
    beacon_id: String,
    editors: Vec<String>,
}

fn beacon_values(id: &str) -> (&'static str, &'static str, &'static str) {
    match id {
        "ember" => ("#B34835", "✕", "Ayu Dark"),
        "lichen" => ("#4B7043", "◆", "Gruvbox Dark"),
        "saffron" => ("#9A6813", "≋", "Solarized Dark"),
        "iris" => ("#66538C", "⌂", "Rosé Pine"),
        "slate" => ("#485E68", "▥", "One Dark"),
        _ => ("#176B78", "◒", "Tokyo Night"),
    }
}

fn merge_json(base: &mut Value, addition: Value) {
    match (base, addition) {
        (Value::Object(base_map), Value::Object(addition_map)) => {
            for (key, value) in addition_map {
                merge_json(base_map.entry(key).or_insert(Value::Null), value);
            }
        }
        (slot, value) => *slot = value,
    }
}

fn read_object(path: &Path) -> Result<Value, String> {
    if !path.exists() {
        return Ok(Value::Object(Map::new()));
    }
    let contents = fs::read_to_string(path).map_err(|error| format!("Could not read {}: {error}", path.display()))?;
    serde_json::from_str(&contents).map_err(|error| format!("{} is not valid JSON: {error}", path.display()))
}

fn write_merged(root: &Path, relative: &str, settings: Value) -> Result<String, String> {
    let path = root.join(relative);
    let parent = path.parent().ok_or_else(|| "The editor file has no parent folder.".to_string())?;
    fs::create_dir_all(parent).map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    let mut existing = read_object(&path)?;
    if !existing.is_object() {
        return Err(format!("{} must contain a JSON object. Fix that file, then try again.", path.display()));
    }
    merge_json(&mut existing, settings);
    let output = serde_json::to_string_pretty(&existing).map_err(|error| error.to_string())? + "\n";
    fs::write(&path, output).map_err(|error| format!("Could not write {}: {error}", path.display()))?;
    Ok(path.display().to_string())
}

#[cfg_attr(feature = "desktop", tauri::command)]
fn configure_project(project: Project) -> Result<Vec<String>, String> {
    let root = PathBuf::from(&project.path);
    if !root.is_absolute() || !root.is_dir() {
        return Err("The chosen project folder does not exist. Choose it again.".to_string());
    }
    if project.name.trim().is_empty() || project.name.chars().count() > 48 {
        return Err("The project name must contain 1 to 48 characters.".to_string());
    }
    let (color, symbol, zed_theme) = beacon_values(&project.beacon_id);
    let mut written = Vec::new();

    if project.editors.iter().any(|editor| editor == "vscode") {
        let value = json!({
            "workbench.colorCustomizations": {
                "titleBar.activeBackground": color,
                "titleBar.activeForeground": "#FFFFFF",
                "statusBar.background": color,
                "statusBar.foreground": "#FFFFFF"
            },
            "window.title": format!("{} {} — ${{activeEditorShort}}", symbol, project.name)
        });
        written.push(write_merged(&root, ".vscode/settings.json", value)?);
    }

    if project.editors.iter().any(|editor| editor == "zed") {
        let value = json!({
            "theme": {
                "mode": "dark",
                "dark": zed_theme,
                "light": zed_theme
            }
        });
        written.push(write_merged(&root, ".zed/settings.json", value)?);
    }

    Ok(written)
}

#[cfg(feature = "desktop")]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![configure_project])
        .run(tauri::generate_context!())
        .expect("Project Color Beacons could not start");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_root(label: &str) -> PathBuf {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("clock")
            .as_nanos();
        std::env::temp_dir().join(format!("pcb-{label}-{}-{nonce}", std::process::id()))
    }

    #[test]
    fn claim_settings_preserved() {
        let root = test_root("merge-test");
        let vscode = root.join(".vscode");
        fs::create_dir_all(&vscode).expect("create test folder");
        fs::write(vscode.join("settings.json"), r##"{"editor.fontSize":16,"workbench.colorCustomizations":{"activityBar.background":"#000000"}}"##).expect("write fixture");
        let project = Project {
            name: "Atlas API".to_string(),
            path: root.display().to_string(),
            beacon_id: "fjord".to_string(),
            editors: vec!["vscode".to_string()],
        };
        configure_project(project).expect("configure project");
        let output: Value = serde_json::from_str(&fs::read_to_string(vscode.join("settings.json")).expect("read output")).expect("parse output");
        assert_eq!(output["editor.fontSize"], 16);
        assert_eq!(output["workbench.colorCustomizations"]["activityBar.background"], "#000000");
        assert_eq!(output["workbench.colorCustomizations"]["statusBar.background"], "#176B78");
        fs::remove_dir_all(root).expect("remove test folder");
    }

    #[test]
    fn claim_supported_editor_settings() {
        let root = test_root("supported-editors");
        fs::create_dir_all(&root).expect("create test folder");
        let project = Project {
            name: "Atlas API".to_string(),
            path: root.display().to_string(),
            beacon_id: "fjord".to_string(),
            editors: vec!["vscode".to_string(), "zed".to_string()],
        };

        let written = configure_project(project).expect("configure both supported editors");
        assert_eq!(written.len(), 2);

        let vscode: Value = serde_json::from_str(&fs::read_to_string(root.join(".vscode/settings.json")).expect("read VS Code settings")).expect("parse VS Code settings");
        assert_eq!(vscode["workbench.colorCustomizations"]["titleBar.activeBackground"], "#176B78");
        assert_eq!(vscode["window.title"], "◒ Atlas API — ${activeEditorShort}");

        let zed: Value = serde_json::from_str(&fs::read_to_string(root.join(".zed/settings.json")).expect("read Zed settings")).expect("parse Zed settings");
        assert_eq!(zed["theme"]["dark"], "Tokyo Night");
        fs::remove_dir_all(root).expect("remove test folder");
    }
}

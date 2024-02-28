// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn add_project(path: &str) -> String {
    format!("Selected path: {}", path)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

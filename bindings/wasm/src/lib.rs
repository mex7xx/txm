use libtxm;
use wasm_bindgen::prelude::*;

/// Render a LaTeX math expression to Unicode art (one newline-separated row per line).
#[wasm_bindgen]
pub fn render(input: &str) -> Result<String, JsValue> {
    libtxm::render(input).map_err(|e| JsValue::from_str(&e.0))
}

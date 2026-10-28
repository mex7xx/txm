use wasm_bindgen::prelude::*;

/// Render a LaTeX math expression to ANSI-styled Unicode art.
///
/// The returned string contains SGR escape sequences (for example
/// `\x1b[3m...\x1b[0m`). Parse failures throw a JavaScript `Error`.
#[wasm_bindgen]
pub fn render(input: &str) -> Result<String, JsError> {
    libtxm::render(input).map_err(|e| JsError::new(&e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::render;

    #[test]
    fn renders_math_with_ansi_styling() {
        let out = render("E = mc^2").expect("render failed");

        assert!(out.contains("mc"), "expected mc in output: {out:?}");
        assert!(out.contains("\x1b["), "expected ANSI styling: {out:?}");
    }
}

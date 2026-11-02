"""
OmniCode Studio - Python SDK & REST Client Example
Supports standard library urllib with optional requests library support.
"""

import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional


class OmniCodeClient:
    def __init__(self, base_url: str = "http://localhost:8080", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    def _request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["x-api-key"] = self.api_key

        body = json.dumps(data).encode("utf-8") if data else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            try:
                err_json = json.loads(err_body)
                raise RuntimeError(f"OmniCode API Error [{e.code}]: {err_json.get('error', err_body)}")
            except json.JSONDecodeError:
                raise RuntimeError(f"OmniCode API HTTP Error [{e.code}]: {err_body}")

    def health(self) -> Dict[str, Any]:
        return self._request("GET", "/health")

    def get_symbologies(self) -> Dict[str, Any]:
        return self._request("GET", "/api/v1/symbologies")

    def generate_qr(
        self,
        data: str,
        ec_level: str = "H",
        size: int = 360,
        dot_type: str = "rounded",
        fg_color: str = "#059669",
        bg_color: str = "#ffffff",
        logo_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        payload = {
            "data": data,
            "ecLevel": ec_level,
            "size": size,
            "dotType": dot_type,
            "fgColor": fg_color,
            "bgColor": bg_color,
        }
        if logo_url:
            payload["logoUrl"] = logo_url
        return self._request("POST", "/api/v1/generate/qr", payload)

    def generate_barcode(
        self,
        format: str,
        data: str,
        style: str = "classic",
        width: int = 2,
        height: int = 90,
        header_text: Optional[str] = None,
        footer_text: Optional[str] = None,
    ) -> Dict[str, Any]:
        payload = {
            "format": format,
            "data": data,
            "style": style,
            "width": width,
            "height": height,
        }
        if header_text:
            payload["headerText"] = header_text
        if footer_text:
            payload["footerText"] = footer_text
        return self._request("POST", "/api/v1/generate/barcode", payload)

    def batch(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._request("POST", "/api/v1/generate/batch", {"items": items})

    def validate(self, format: str, data: str) -> Dict[str, Any]:
        return self._request("POST", "/api/v1/validate", {
            "type": "barcode",
            "format": format,
            "data": data
        })

    def export(self, code_type: str, options: Dict[str, Any], output_format: str = "base64") -> Dict[str, Any]:
        return self._request("POST", "/api/v1/export", {
            "type": code_type,
            "outputFormat": output_format,
            "options": options
        })


if __name__ == "__main__":
    client = OmniCodeClient("http://localhost:8080")
    print("OmniCode Python Client initialized. Ready to connect.")

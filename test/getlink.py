import re
from urllib.parse import urlparse

import requests


def resolve_shopee_short_url(short_url: str) -> dict:
    """
    Resolve a Shopee short link and extract shopid/itemid when possible.
    """

    def build_result(
        final_url=None, shopid=None, itemid=None, product_id=None, error=None
    ) -> dict:
        return {
            "short_url": short_url,
            "final_url": final_url,
            "shopid": shopid,
            "itemid": itemid,
            "product_id": product_id,
            "error": error,
        }

    parsed = urlparse(short_url)
    if not parsed.scheme or not parsed.netloc:
        return build_result(error="invalid_url")

    if parsed.netloc.lower() != "s.shopee.vn":
        return build_result(error="not_shopee_short_url")

    try:
        response = requests.get(short_url, allow_redirects=True, timeout=10)
        final_url = response.url
    except requests.exceptions.Timeout:
        return build_result(error="timeout")
    except requests.exceptions.RequestException:
        return build_result(error="network_error")

    shopid = itemid = product_id = None
    if final_url:
        patterns = [
            r"/product/(\d+)/(\d+)",
            r"i\.(\d+)\.(\d+)",
            r"/(\d{6,})/(\d{6,})(?:[/?]|$)",
        ]
        match = None
        for pattern in patterns:
            match = re.search(pattern, final_url)
            if match:
                break
        if match:
            shopid, itemid = match.groups()
            product_id = f"i.{shopid}.{itemid}"

    return build_result(
        final_url=final_url, shopid=shopid, itemid=itemid, product_id=product_id
    )


if __name__ == "__main__":
    # Ví dụ nhanh
    print(resolve_shopee_short_url("https://s.shopee.vn/9UuCnuLvMJ"))


import os 
from typing import Optional

from fastapi import Request, Depends, HTTPException, status
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer

CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

if CLERK_JWKS_URL:
    _clerk_config = ClerkConfig(jwks_url=CLERK_JWKS_URL)

    # not the complete version still testing backend auth layer
    clerk_auth_guard = ClerkHTTPBearer(config=_clerk_config, auto_error=False)
else:
    # CLERK_JWKS_URL not configured (e.g. local/offline dev that never
    # needs auth at all) -- fall back to a no-op so the app doesn't crash
    # on import when the env var is simply absent.
    async def clerk_auth_guard(request: Request):
        return None


def get_current_user_id(credentials) -> Optional[str]:
    """
    Pulls the Clerk user id (the `sub` claim) out of a verified token.
    Returns None if there was no token or it didn't verify
    """
    if credentials and credentials.decoded:
        return credentials.decoded.get("sub")
    return None

def require_current_user_id(credentials=Depends(clerk_auth_guard)) -> str:
    """
    Same verification as clerk_auth_guard, but actually enforces it --
    raises 401 if there's no valid signed-in user.
    """
    user_id = get_current_user_id(credentials)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user_id
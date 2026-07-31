import os

import boto3
from botocore.exceptions import ClientError
from botocore.client import Config

_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("B2_ENDPOINT_URL"),
    aws_access_key_id=os.getenv("B2_KEY_ID"),
    aws_secret_access_key=os.getenv("B2_APPLICATION_KEY"),
    region_name=os.getenv("B2_REGION"),
    config=Config(signature_version="s3v4")
)

BUCKET = os.getenv("B2_BUCKET_NAME")

DEFAULT_URL_EXPIRY_SECONDS = 3600


def upload_file(local_path: str, key: str) -> None:
    _client.upload_file(local_path, BUCKET, key)


def delete_file(key: str) -> None:
    try:
        _client.delete_object(Bucket=BUCKET, Key=key)
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") not in ("NoSuchKey", "404"):
            raise


def get_playback_url(key: str, expires_in: int = DEFAULT_URL_EXPIRY_SECONDS) -> str:
    return _client.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=expires_in
    )
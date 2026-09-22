from strands.session import SessionManager


def get_session_manager() -> SessionManager | None:
    """会話履歴は保存しない（ローカル開発でも本番でも）。

    写真や他人のメッセージをディスクや S3 に残さないため。1回の読み取りは1回のリクエストで完結する。
    """
    return None

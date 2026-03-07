from pydantic_settings import BaseSettings, SettingsConfigDict
    
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore'
    )
    
class AppConfig(Settings):
    log_level: str = 'INFO'
    
class Database(Settings):
    host: str
    port: int
    username: str
    password: str
    name: str
    
    model_config = SettingsConfigDict(
        env_prefix='db_'
    )
    
class JWT(Settings):
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    login_token_expire_minutes: int
    
    model_config = SettingsConfigDict(
        env_prefix='jwt_'
    )
    
# class Authsch(Settings):
#     client_id: str
#     client_secret: str
#     redirect_uri: str
#     token_url: str
#     userinfo_url: str
    
#     model_config = SettingsConfigDict(
#         env_prefix='authsch_'
#     )
    
class Google(Settings):
    client_id: str
    client_secret: str
    redirect_uri: str
    token_url: str
    userinfo_url: str
    
    model_config = SettingsConfigDict(
        env_prefix='google_'
    )

class Frontend(Settings):
    auth_callback: str
    
    model_config = SettingsConfigDict(
        env_prefix='frontend_'
    )
app_configs = AppConfig()
database = Database()
jwt_config = JWT()
# authsch_config = Authsch()
google_config = Google()
frontend_config = Frontend()
@echo off
echo ============================================
echo   EduPrep SaaS - Build APK Android
echo ============================================
echo.

set EAS_NO_VCS=1
set PATH=C:\Program Files\nodejs;%PATH%

echo [1/2] Gerando keystore e iniciando build...
echo    (Responda Y quando perguntar sobre o Keystore)
echo.
call npx eas-cli build --platform android --profile preview

echo.
echo ============================================
echo   Verifique o progresso em:
echo   https://expo.dev/accounts/sixmc/projects/eduprep-saas/builds
echo.
echo   Quando concluido, faca download do APK
echo   e instale no seu Android.
echo ============================================
pause

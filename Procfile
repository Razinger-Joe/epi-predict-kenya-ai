# 🎓 LEARNING: Procfile
# This tells Railway/Heroku how to run your application
# web: is the process type (HTTP server)

web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

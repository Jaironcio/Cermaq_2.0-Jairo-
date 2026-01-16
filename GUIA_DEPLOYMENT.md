# 🚀 Guía de Deployment - Sistema de Control Cermaq

## 📋 Opciones de Hosting Recomendadas

### **Opción 1: PythonAnywhere** ⭐ (RECOMENDADO PARA EMPEZAR)
**Precio**: Gratis hasta 100k hits/mes, luego desde $5/mes  
**Ventajas**:
- ✅ Muy fácil de configurar (15 minutos)
- ✅ Soporte nativo para Django
- ✅ Base de datos MySQL incluida
- ✅ SSL/HTTPS gratis
- ✅ Ideal para proyectos pequeños/medianos

**Pasos**:
1. Crear cuenta en https://www.pythonanywhere.com
2. Subir código via Git o upload
3. Configurar virtualenv
4. Configurar WSGI
5. Listo!

---

### **Opción 2: Railway** ⭐⭐
**Precio**: $5/mes (500 horas gratis al mes)  
**Ventajas**:
- ✅ Deploy automático desde GitHub
- ✅ Base de datos MySQL/PostgreSQL incluida
- ✅ Muy moderno y fácil
- ✅ Escalable

**Pasos**:
1. Conectar GitHub
2. Seleccionar repositorio
3. Railway detecta Django automáticamente
4. Deploy!

---

### **Opción 3: Render** ⭐⭐
**Precio**: Gratis (con limitaciones), desde $7/mes  
**Ventajas**:
- ✅ Deploy desde GitHub
- ✅ SSL gratis
- ✅ Fácil configuración
- ✅ PostgreSQL gratis

---

### **Opción 4: DigitalOcean / AWS / Azure** ⭐⭐⭐
**Precio**: Desde $5-10/mes  
**Ventajas**:
- ✅ Control total
- ✅ Muy escalable
- ✅ Profesional

**Desventajas**:
- ❌ Requiere más conocimientos técnicos
- ❌ Configuración manual

---

## 🛠️ Preparación del Proyecto

### 1. Instalar Dependencias de Producción

```bash
pip install gunicorn python-decouple whitenoise psycopg2-binary
pip freeze > requirements.txt
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` (NO subir a Git):

```env
SECRET_KEY=tu-secret-key-super-segura
DEBUG=False
ALLOWED_HOSTS=tudominio.com,www.tudominio.com
DB_NAME=cermaq_db
DB_USER=cermaq_user
DB_PASSWORD=password_seguro
DB_HOST=localhost
DB_PORT=3306
```

### 3. Actualizar `settings.py`

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}

# Archivos estáticos
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

# WhiteNoise para servir archivos estáticos
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Agregar aquí
    # ... resto del middleware
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 4. Crear `requirements.txt`

```txt
Django==5.2.8
djangorestframework==3.14.0
mysqlclient==2.2.0
gunicorn==21.2.0
python-decouple==3.8
whitenoise==6.6.0
openpyxl==3.1.2
```

### 5. Crear `Procfile` (para Railway/Render)

```
web: gunicorn config.wsgi --log-file -
```

### 6. Crear `runtime.txt`

```
python-3.11.0
```

---

## 📦 Deployment en PythonAnywhere (Paso a Paso)

### Paso 1: Crear Cuenta
1. Ir a https://www.pythonanywhere.com
2. Crear cuenta gratuita
3. Verificar email

### Paso 2: Subir Código

**Opción A: Via Git (Recomendado)**
```bash
# En tu máquina local
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tuusuario/cermaq.git
git push -u origin main

# En PythonAnywhere Console
git clone https://github.com/tuusuario/cermaq.git
```

**Opción B: Upload Manual**
- Comprimir proyecto en .zip
- Subir via Files en PythonAnywhere
- Descomprimir

### Paso 3: Crear Virtual Environment

```bash
cd ~/cermaq
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Paso 4: Configurar Base de Datos

1. Ir a "Databases" en PythonAnywhere
2. Crear base de datos MySQL
3. Anotar: nombre, usuario, password, host

```bash
# Crear archivo .env
nano .env
# Pegar configuración
```

### Paso 5: Migrar Base de Datos

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### Paso 6: Configurar WSGI

1. Ir a "Web" → "Add a new web app"
2. Seleccionar "Manual configuration"
3. Python 3.11
4. Editar WSGI file:

```python
import sys
import os

# Agregar path del proyecto
path = '/home/tuusuario/cermaq'
if path not in sys.path:
    sys.path.append(path)

# Configurar Django settings
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

# Cargar variables de entorno
from dotenv import load_dotenv
project_folder = os.path.expanduser('~/cermaq')
load_dotenv(os.path.join(project_folder, '.env'))

# WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### Paso 7: Configurar Archivos Estáticos

En la pestaña "Web":
- Static files URL: `/static/`
- Static files directory: `/home/tuusuario/cermaq/staticfiles/`

### Paso 8: Reload y Probar

1. Click en "Reload" (botón verde)
2. Visitar: `https://tuusuario.pythonanywhere.com`
3. ¡Listo!

---

## 🚀 Deployment en Railway

### Paso 1: Preparar GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tuusuario/cermaq.git
git push -u origin main
```

### Paso 2: Crear Proyecto en Railway

1. Ir a https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Seleccionar tu repositorio

### Paso 3: Agregar Base de Datos

1. "New" → "Database" → "MySQL"
2. Railway crea la BD automáticamente
3. Copiar variables de entorno

### Paso 4: Configurar Variables

En Railway → Variables:
```
SECRET_KEY=tu-secret-key
DEBUG=False
ALLOWED_HOSTS=${{RAILWAY_STATIC_URL}}
DATABASE_URL=${{MYSQL_URL}}
```

### Paso 5: Deploy

Railway detecta Django y hace deploy automático!

---

## 🔒 Seguridad en Producción

### Checklist de Seguridad:

- ✅ `DEBUG = False`
- ✅ `SECRET_KEY` en variable de entorno
- ✅ `ALLOWED_HOSTS` configurado correctamente
- ✅ HTTPS habilitado
- ✅ Contraseñas de BD seguras
- ✅ `.env` en `.gitignore`
- ✅ CSRF_TRUSTED_ORIGINS configurado
- ✅ Firewall configurado (si aplica)

### Generar SECRET_KEY Segura:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

---

## 📊 Monitoreo Post-Deployment

### Logs en PythonAnywhere:
- Web → Log files → Error log
- Web → Log files → Server log

### Comandos Útiles:

```bash
# Ver logs en tiempo real
tail -f /var/log/tuusuario.pythonanywhere.com.error.log

# Reiniciar aplicación
touch /var/www/tuusuario_pythonanywhere_com_wsgi.py

# Actualizar código
cd ~/cermaq
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
# Reload desde web interface
```

---

## 🆘 Troubleshooting

### Error: "DisallowedHost"
**Solución**: Agregar dominio a `ALLOWED_HOSTS` en settings.py

### Error: "Static files not loading"
**Solución**: 
```bash
python manage.py collectstatic --noinput
```
Verificar configuración de WhiteNoise

### Error: "Database connection failed"
**Solución**: Verificar credenciales en `.env`

### Error: "500 Internal Server Error"
**Solución**: Revisar logs de error

---

## 💰 Costos Estimados

| Hosting | Gratis | Básico | Profesional |
|---------|--------|--------|-------------|
| **PythonAnywhere** | 100k hits/mes | $5/mes | $12/mes |
| **Railway** | 500h/mes | $5/mes | $20/mes |
| **Render** | Limitado | $7/mes | $25/mes |
| **DigitalOcean** | - | $6/mes | $12-48/mes |

---

## 🎯 Recomendación Final

**Para empezar**: PythonAnywhere (plan gratuito)  
**Para producción seria**: Railway o DigitalOcean  
**Para empresa**: AWS/Azure con soporte profesional

---

## 📞 Siguiente Paso

1. Elige tu plataforma de hosting
2. Sigue la guía paso a paso
3. Configura las variables de entorno
4. Haz deploy
5. Prueba todo funcione correctamente

**¿Necesitas ayuda con algún paso específico?** Avísame y te guío en detalle.

# Publicar la tienda en el servidor (VPS)

Guía para instalar Margarita en el mismo VPS de La Puntual. La tienda corre
como una aplicación aparte (Node.js) y no toca nada de La Puntual (Java + MySQL).

> Los comandos se ejecutan en el servidor, conectado por SSH.

## 1. Requisitos (una sola vez)

Instalar Node.js 20 o superior y PM2, que mantiene la tienda prendida y la
reinicia sola si el servidor se reinicia:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
node -v   # tiene que decir v20 o más
```

## 2. Descargar el proyecto

```bash
cd /opt
sudo git clone https://github.com/larrayagaston95/Web_Margarita.git margarita
sudo chown -R $USER:$USER /opt/margarita
cd /opt/margarita
```

## 3. Configurar `.env`

```bash
cp .env.example .env
nano .env
```

Completar como mínimo:

```
ADMIN_PASSWORD="una-contraseña-larga-y-única"
PORT=3000
```

`PORT` tiene que ser un puerto libre. La Puntual usa el 8081/8083, así que
el 3000 no choca. Para ver qué puertos están ocupados: `sudo ss -tlnp`.

## 4. Compilar y arrancar

```bash
npm ci
npm run build
pm2 start npm --name margarita -- start
pm2 save
pm2 startup     # copiar y ejecutar el comando que muestra
```

Probar: `curl http://localhost:3000/api/productos` tiene que devolver la lista de productos.

## 5. Dominio (Nginx)

Si el VPS ya usa Nginx para La Puntual, se agrega un archivo nuevo, por ejemplo
`/etc/nginx/sites-available/margarita`:

```nginx
server {
    server_name nueva.margaritaindumentaria.com.ar;

    client_max_body_size 15M;   # para poder subir fotos desde el panel

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/margarita /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d nueva.margaritaindumentaria.com.ar   # HTTPS gratis
```

⚠️ **Probar primero con un subdominio** (por ejemplo `nueva.`). Hoy
`margaritaindumentaria.com.ar` apunta a la tienda WordPress. Cambiar el dominio
principal reemplaza esa tienda, así que conviene hacerlo recién cuando los
productos estén cargados en la nueva. En el panel DNS del dominio hay que crear
un registro **A** de `nueva` apuntando a la IP del VPS.

## 6. Dónde quedan los datos

Todo lo que se carga desde `/admin` se guarda en `/opt/margarita/data/`:

| Archivo | Contenido |
|---|---|
| `productos.json` | Productos |
| `pedidos.json` | Pedidos |
| `notificaciones.json` | Avisos del panel |
| `imagenes/` | Fotos subidas |

**Copia de seguridad diaria** (con `crontab -e`, a las 3 AM; guarda las últimas 14):

```cron
0 3 * * * tar czf /root/backups/margarita-$(date +\%F).tar.gz -C /opt/margarita data && ls -1t /root/backups/margarita-*.tar.gz | tail -n +15 | xargs -r rm
```

(Crear antes la carpeta: `mkdir -p /root/backups`.)

## 7. Actualizar cuando haya cambios en GitHub

```bash
cd /opt/margarita
git pull
npm ci
npm run build
pm2 restart margarita
```

La carpeta `data/` no se toca al actualizar.

## Comandos útiles

```bash
pm2 status              # ver si está corriendo
pm2 logs margarita      # ver errores
pm2 restart margarita   # reiniciar
```

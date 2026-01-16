# incidencias/management/commands/actualizar_telefonos.py
"""
Comando para actualizar los teléfonos de operarios desde el archivo de texto.
"""
from django.core.management.base import BaseCommand
from incidencias.models import Operario, Centro

# Diccionario de teléfonos por centro y nombre
TELEFONOS = {
    'cipreses': {
        # Jefe de centro
        'roberto alarcon': '+569 6155 6741',
        'roberto alarcón': '+569 6155 6741',
        # Asistentes de centro
        'claudio zuñiga': '+569 8582 2564',
        'claudio zuniga': '+569 8582 2564',
        'claudio zúñiga': '+569 8582 2564',
        'dominique cabrera': '+569 6181 0024',
        'jorge vidal': '+569 5361 2276',
        'marcelo mena': '+569 9884 2121',
        'rodrigo lopez': '+569 6721 4135',
        'rodrigo lópez': '+569 6721 4135',
        'sebastian peralta': '+569 8475 6452',
        'sebastián peralta': '+569 8475 6452',
        # Técnicos
        'tecnicos turno dia': '65 256 8165',
        'técnicos turno día': '65 256 8165',
        'tecnicos turno día': '65 256 8165',
        # Operarios
        'operarios turno tarde/noche': '+569 8932 3982',
        'operario tarde/noche': '+569 8932 3982',
        'turno tarde/noche': '+569 8932 3982',
    },
    'liquine': {
        # Jefe de centro
        'roberto parra': '+569 4471 6465',
        # Asistentes de centro
        'manuel krebs': '+569 8832 4988',
        'guillermo contreras': '+569 4093 5028',
        'diego pichun': '+569 4421 4065',
        # Operarios
        'genaro delgado': '+569 6627 4984',
        'gerardo diaz': '+569 4099 8354',
        'gerardo díaz': '+569 4099 8354',
        'guido diaz': '+569 9383 0562',
        'guido díaz': '+569 9383 0562',
        'ivan curiñaco': '+569 7750 7021',
        'iván curiñaco': '+569 7750 7021',
        'jose cardenas': '+569 4178 5650',
        'josé cárdenas': '+569 4178 5650',
        'miguel cariman': '+569 5654 0215',
        'oscar melinao': '+569 9573 0288',
        # Celular centro
        'celular centro': '+569 3410 0884',
    },
    'trafun': {
        # Jefe de centro
        'victor hugo perez': '+569 5738 2933',
        'víctor hugo pérez': '+569 5738 2933',
        # Asistentes de centro
        'will prato': '+569 3070 1493',
        'victor orrego': '+569 9318 6653',
        'víctor orrego': '+569 9318 6653',
        'marcelo saldaña': '+569 5580 2191',
        'marcelo saldana': '+569 5580 2191',
        'ivan aguayo': '+569 5738 8101',
        'iván aguayo': '+569 5738 8101',
        'boris cortes': '+569 5218 7753',
        'boris cortés': '+569 5218 7753',
        # Operarios
        'operario tarde/noche': '+569 6198 7694',
        'turno tarde/noche': '+569 6198 7694',
        'turno tarde/ noche': '+569 6198 7694',
    },
}

# Jefe de monitoreo (aplica a todos)
JEFE_MONITOREO = {
    'samuel gaez': '+569 7272 1618',
    'samuel gáez': '+569 7272 1618',
}


class Command(BaseCommand):
    help = "Actualiza los teléfonos de operarios desde el archivo de configuración"

    def handle(self, *args, **options):
        actualizados = 0
        no_encontrados = []

        for operario in Operario.objects.all():
            nombre_lower = operario.nombre.lower().strip()
            centro_slug = operario.centro.slug if operario.centro else ''
            
            telefono = None
            
            # Buscar en el diccionario del centro
            if centro_slug in TELEFONOS:
                telefono = TELEFONOS[centro_slug].get(nombre_lower)
            
            # Si no se encontró, buscar en jefe de monitoreo
            if not telefono:
                telefono = JEFE_MONITOREO.get(nombre_lower)
            
            # Si encontramos teléfono, actualizar
            if telefono:
                operario.telefono = telefono
                operario.save()
                actualizados += 1
                self.stdout.write(f"[OK] {operario.nombre} ({centro_slug}): {telefono}")
            else:
                if nombre_lower not in ['asistente de turno', 'operario', 'tecnicos', 'operarios']:
                    no_encontrados.append(f"{operario.nombre} ({centro_slug})")

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS(f"Operarios actualizados: {actualizados}"))
        
        if no_encontrados:
            self.stdout.write(self.style.WARNING(f"\nNo se encontró teléfono para {len(no_encontrados)} operarios:"))
            for nombre in no_encontrados[:10]:
                self.stdout.write(f"  - {nombre}")
            if len(no_encontrados) > 10:
                self.stdout.write(f"  ... y {len(no_encontrados) - 10} más")

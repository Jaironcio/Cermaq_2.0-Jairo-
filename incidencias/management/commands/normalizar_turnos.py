from django.core.management.base import BaseCommand
from incidencias.models import Incidencia


class Command(BaseCommand):
    help = 'Normaliza los turnos en la base de datos: convierte Dia/Día a Mañana'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando normalización de turnos...')
        
        # Buscar incidencias con turno "Dia" o "Día"
        incidencias_dia = Incidencia.objects.filter(turno__in=['Dia', 'Día', 'dia', 'día'])
        total = incidencias_dia.count()
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('No hay turnos que normalizar.'))
            return
        
        self.stdout.write(f'Encontradas {total} incidencias con turno "Dia/Día"')
        
        # Actualizar a "Mañana"
        actualizadas = incidencias_dia.update(turno='Mañana')
        
        self.stdout.write(self.style.SUCCESS(f'✓ {actualizadas} incidencias actualizadas de "Dia" a "Mañana"'))

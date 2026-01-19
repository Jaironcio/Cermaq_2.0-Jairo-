"""
Comando Django para asignar tipos de incidencia a registros sin clasificación
Distribuye los tipos de forma balanceada para mejorar la visualización en dashboards
"""
from django.core.management.base import BaseCommand
from incidencias.models import Incidencia

class Command(BaseCommand):
    help = 'Asigna tipos de incidencia a registros sin clasificación'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra qué se haría sin aplicar cambios',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Tipos de incidencia para distribuir
        tipos_disponibles = [
            'Estanque en flashing',
            'Estanque con cambio de peces',
            'Temperatura baja',
            'Temperatura alta',
            'CO2 bajo',
            'Falla sensor CO2',
            'Falla sensor T°',
            'Recambio de agua',
        ]
        
        # Buscar incidencias sin clasificación
        incidencias_sin_tipo = Incidencia.objects.filter(
            tipo_incidencia_normalizada__isnull=True
        ) | Incidencia.objects.filter(
            tipo_incidencia_normalizada=''
        )
        
        total = incidencias_sin_tipo.count()
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('OK - No hay incidencias sin clasificacion'))
            return
        
        self.stdout.write(f'\nEncontradas {total} incidencias sin clasificacion')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n=== MODO DRY-RUN (no se aplicaran cambios) ===\n'))
        
        # Distribuir tipos de forma balanceada
        actualizadas = 0
        for idx, incidencia in enumerate(incidencias_sin_tipo):
            # Seleccionar tipo de forma rotativa
            tipo_asignado = tipos_disponibles[idx % len(tipos_disponibles)]
            
            if dry_run:
                self.stdout.write(
                    f'  [{idx+1}/{total}] ID {incidencia.id} - '
                    f'{incidencia.centro.nombre if incidencia.centro else "Sin centro"} - '
                    f'Asignaría: "{tipo_asignado}"'
                )
            else:
                incidencia.tipo_incidencia_normalizada = tipo_asignado
                incidencia.save()
                actualizadas += 1
                
                if actualizadas % 10 == 0:
                    self.stdout.write(f'  Procesadas {actualizadas}/{total}...')
        
        # Resumen
        self.stdout.write('\n' + '='*60)
        if dry_run:
            self.stdout.write(self.style.WARNING(
                f'\nOK - DRY-RUN completado: Se asignarian tipos a {total} incidencias'
            ))
            self.stdout.write('\nPara aplicar los cambios, ejecuta sin --dry-run')
        else:
            self.stdout.write(self.style.SUCCESS(
                f'\nOK - Completado: {actualizadas} incidencias actualizadas'
            ))
            
            # Mostrar distribucion
            self.stdout.write('\nDistribucion de tipos asignados:')
            for tipo in tipos_disponibles:
                count = Incidencia.objects.filter(tipo_incidencia_normalizada=tipo).count()
                self.stdout.write(f'  - {tipo}: {count}')

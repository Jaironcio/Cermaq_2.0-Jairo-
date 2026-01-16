from __future__ import annotations

import secrets

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Crea o asegura usuarios base (admin y visualizador) para el sistema."

    def add_arguments(self, parser):
        parser.add_argument(
            "--admin-username",
            default="admin",
            help="Username del administrador (default: admin)",
        )
        parser.add_argument(
            "--viewer-username",
            default="visualizador",
            help="Username del visualizador (default: visualizador)",
        )
        parser.add_argument(
            "--admin-password",
            default=None,
            help="Password del admin. Si se omite, se genera uno aleatorio.",
        )
        parser.add_argument(
            "--viewer-password",
            default=None,
            help="Password del visualizador. Si se omite, se genera uno aleatorio.",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Si se indica, resetea la contraseña aunque el usuario ya exista.",
        )

    def _random_password(self) -> str:
        return secrets.token_urlsafe(12)

    def _ensure_user(
        self,
        *,
        username: str,
        password: str | None,
        is_staff: bool,
        is_superuser: bool,
        reset: bool,
    ) -> tuple[object, str | None, bool]:
        User = get_user_model()

        created = False
        user = User.objects.filter(username=username).first()
        if user is None:
            created = True
            user = User.objects.create_user(username=username)

        changed_password = False
        final_password: str | None = None

        if created or reset:
            final_password = password or self._random_password()
            user.set_password(final_password)
            changed_password = True

        need_save = False
        if getattr(user, "is_active", True) is False:
            user.is_active = True
            need_save = True

        if user.is_staff != is_staff:
            user.is_staff = is_staff
            need_save = True

        if user.is_superuser != is_superuser:
            user.is_superuser = is_superuser
            need_save = True

        if changed_password or need_save:
            user.save()

        return user, final_password, created

    def handle(self, *args, **options):
        admin_username: str = options["admin_username"]
        viewer_username: str = options["viewer_username"]
        admin_password: str | None = options["admin_password"]
        viewer_password: str | None = options["viewer_password"]
        reset: bool = options["reset"]

        admin_user, admin_final_password, admin_created = self._ensure_user(
            username=admin_username,
            password=admin_password,
            is_staff=True,
            is_superuser=True,
            reset=reset,
        )
        viewer_user, viewer_final_password, viewer_created = self._ensure_user(
            username=viewer_username,
            password=viewer_password,
            is_staff=False,
            is_superuser=False,
            reset=reset,
        )

        self.stdout.write(self.style.SUCCESS("Usuarios asegurados."))

        if admin_created:
            self.stdout.write(self.style.SUCCESS(f"Admin creado: {admin_user.username}"))
        else:
            self.stdout.write(self.style.WARNING(f"Admin ya existía: {admin_user.username}"))

        if admin_final_password is not None:
            self.stdout.write(f"Admin password: {admin_final_password}")
        else:
            self.stdout.write("Admin password: (sin cambios)")

        if viewer_created:
            self.stdout.write(
                self.style.SUCCESS(f"Visualizador creado: {viewer_user.username}")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"Visualizador ya existía: {viewer_user.username}")
            )

        if viewer_final_password is not None:
            self.stdout.write(f"Visualizador password: {viewer_final_password}")
        else:
            self.stdout.write("Visualizador password: (sin cambios)")

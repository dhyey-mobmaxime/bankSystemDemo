from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):

    def _create_user(self, email, password, is_staff, is_superuser, userType, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        now = timezone.now()
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            is_staff=is_staff,
            is_active=True,
            is_superuser=is_superuser,
            user_type=userType,
            last_login=now,
            created_at=now,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        user = self._create_user(email, password, True, True, 1, **extra_fields)
        user.save(using=self._db)
        return user

    def create_customer(self, password, email, **extra_fields):
        user = self._create_user(email, password, False, False, 2, **extra_fields)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    Manager = 1
    Customer = 2
    USER_TYPE_CHOICES = (
        (1, 'manager'),
        (2, 'customer'),
    )
    user_type = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES)
    firstName = models.CharField(max_length=30, null=False, blank=False)
    lastName = models.CharField(max_length=30, null=False, blank=False)
    username = models.CharField(db_index=True, max_length=255, blank=True, null=True)
    email = models.EmailField(db_index=True, unique=True)
    account_number = models.CharField(max_length=10, null=False, blank=False, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    current_balance = models.FloatField(default=0.0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    # objects of this type.
    objects = UserManager()

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username


class Transaction(models.Model):
    TRANSACTION_TYPE = (
        (1, 'debit'),
        (2, 'credit'),
    )
    transaction_type = models.PositiveSmallIntegerField(choices=TRANSACTION_TYPE)
    amount = models.FloatField(null=False, blank=False)
    account = models.ForeignKey(User, to_field='account_number', on_delete=models.DO_NOTHING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

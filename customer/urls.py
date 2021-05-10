from django.contrib.auth.decorators import login_required
from django.urls import path
from .views import *

app_name = 'customer'

urlpatterns = [
    path('login', LogIn.as_view(), name="login"),
    path('logout', LogOut.as_view(), name="logout"),
    path('', login_required(Index.as_view()), name="index"),
    path('customers/', login_required(CustomerListing.as_view()), name="customerListing"),
    path('transactions/', login_required(TransactionListing.as_view()), name="transactionsListing"),
    path('api/transactions', login_required(TransactionListingAPI), name="transactionsListingAPi"),
]

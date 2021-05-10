from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, RedirectView, ListView
from customer.models import User, Transaction
import string, random
from django.http import JsonResponse
from .tasks import *

def generateAccountNumber(chars=string.digits):
    return ''.join(random.choice(chars) for _ in range(10))

class LogIn(TemplateView):
    template_name = "login.html"

    def post(self, request):
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        context = {}
        if user is not None:
            if not user.is_active:
                context['msg'] = "User is not Active! Contact To Admin!"
                context['type'] = "danger"
                return render(request, "login.html", context=context)
            login(request, user)
            return redirect('customer:index')
        context['msg'] = "No User found with this Username!!"
        context['type'] = "danger"
        return render(request, "login.html", context=context)


class LogOut(RedirectView):
    url = '/'

    def get(self, request, *args, **kwargs):
        logout(request)
        return super(LogOut, self).get(request, *args, **kwargs)

class Index(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.user_type == 1:
            context["transactions"] = Transaction.objects.all().order_by('-created_at')[:5]
        return context

    def post(self, request):
        if "deposit" in request.POST:
            amount = float(request.POST["amount"])
            tran = Transaction.objects.create(amount=amount, transaction_type=2, account=request.user)
            request.user.current_balance = request.user.current_balance + amount
            request.user.save()
            messages.success(request, 'Amount Successfully Deposited...')
            send_Credit_Transaction_Email.delay(request.user.firstName+" "+request.user.lastName, request.user.email, amount)
        elif "withdrawn" in request.POST:
            amount = float(request.POST["amount"])
            if request.user.current_balance > amount:
                tran = Transaction.objects.create(amount=amount, transaction_type=1, account=request.user)
                request.user.current_balance = request.user.current_balance - amount
                request.user.save()
                messages.success(request, 'Amount Successfully Withdrawn...')
                send_Debit_Transaction_Email.delay(request.user.firstName+" "+request.user.lastName, request.user.email, amount)
            else:
                messages.warning(request, 'Insufficient balance In Account...')
        else:
            messages.success(request, 'Account Balance fetched Successfully...')
            balance = request.user.current_balance
            return render(request, "index.html", context={"balance":balance})
        return redirect("customer:index")

class CustomerListing(ListView):
    template_name = 'user_listing.html'
    model = User
    context_object_name = 'users'
    paginate_by = 10
    queryset = User.objects.filter(is_superuser=False)

    def post(self, request, *args, **kwargs):
        userData = self.request.POST.dict()
        accountNumber = generateAccountNumber()
        while User.objects.filter(account_number=accountNumber).exists():
            accountNumber = generateAccountNumber()
        userData["account_number"] = accountNumber
        userData.pop("csrfmiddlewaretoken")
        userData.pop("cpassword")
        newUser = User.objects.create_customer(**userData)
        print("newUser", newUser)
        return redirect("customer:customerListing")

class TransactionListing(TemplateView):
    template_name = 'transactions.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.user_type == 1:
            context["users"] = User.objects.filter(is_superuser=False)
        return context

def TransactionListingAPI(request):
    finalData = []
    selectedUser = request.GET.get("userid", None)
    dateFrom = request.GET.get("dateFrom", None)
    dateTo = request.GET.get("dateTo", None)
    print(selectedUser, dateFrom, dateTo)
    if dateFrom and dateTo:
        allData = Transaction.objects.filter(created_at__range=[dateFrom,dateTo]).order_by('-created_at')
    else:
        allData = Transaction.objects.all().order_by('-created_at')
    if selectedUser:
        allData = allData.filter(account__id__in=[int(selectedUser)])
    for index, data in enumerate(allData, 1):
        finalData.append({"id": index, "firstName": data.account.firstName, "lastName": data.account.lastName,
                          "transactionType": "Debit" if data.transaction_type == 1 else "Credit", "amount": data.amount,
                          "accountNumber": data.account.account_number, "time": data.created_at.strftime("%m/%d/%Y %I:%M %p")})
    return JsonResponse(data ={"data": finalData}, safe=False)

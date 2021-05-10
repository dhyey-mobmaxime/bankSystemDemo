from django.template.loader import render_to_string
from django.conf import settings
from bank._celery import app
from django.core.mail import EmailMultiAlternatives
import logging
logger = logging.getLogger('celery')

@app.task
def send_Debit_Transaction_Email(username,useremail,amount):
    logger.info("Prepared Mail for ->" + useremail)
    subject = 'Debit Transaction Update'
    text_content = render_to_string('emailTemplates/debit.html', {
        'name': username,
        'amount': amount,
    })
    html_content = render_to_string('emailTemplates/debit.html', {
        'name': username,
        'amount': amount,
    })
    msg = EmailMultiAlternatives(subject, text_content, settings.EMAIL_HOST_USER, [useremail])
    msg.attach_alternative(html_content, "text/html")
    msg.send()
    logger.info("Debit Mail Sent for ->" + useremail)

@app.task
def send_Credit_Transaction_Email(username, useremail, amount):
    logger.info("Prepared Credit Mail for ->" + useremail)
    subject = 'Credit Transaction Update'
    text_content = render_to_string('emailTemplates/credit.html', {
        'name': username,
        'amount': amount,
    })
    html_content = render_to_string('emailTemplates/credit.html', {
        'name': username,
        'amount': amount,
    })
    msg = EmailMultiAlternatives(subject, text_content, settings.EMAIL_HOST_USER, [useremail])
    msg.attach_alternative(html_content, "text/html")
    msg.send()
    logger.info("Credit Mail Sent for ->" + useremail)

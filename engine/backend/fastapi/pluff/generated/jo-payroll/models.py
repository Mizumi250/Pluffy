# ARKZEN GENERATED MODELS: jo-payroll (FastAPI). Do not edit.
from pluff.runtime import *

class JobOrder(Model):
    table = "jo_payroll_job_orders"
    connection_name = "jo-payroll"
    fillable = ['jor_number', 'name_of_jo', 'job_title', 'funding', 'basic_pay', 'disbursement_type', 'jor_pyrl_group', 'hdmf_no', 'cash_card', 'cash_card_number', 'sss_number', 'sss_amount', 'calamity_loan', 'hdmf_mpl', 'hdmf_premium', 'last_name', 'first_name', 'middle_name', 'appointment_date', 'appointment_order', 'status']
    casts = {'id': 'integer', 'jor_number': 'integer', 'basic_pay': 'decimal:2', 'sss_amount': 'decimal:2', 'calamity_loan': 'decimal:2', 'hdmf_mpl': 'decimal:2', 'hdmf_premium': 'decimal:2', 'appointment_date': 'date', 'appointment_order': 'integer'}
    timestamps = True
    soft_deletes = False




# ARKZEN GENERATED CONTROLLERS: jo-payroll
from pluff.runtime import *
from .models import JobOrder
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class JobOrderController:
    @staticmethod
    async def index(request, response):
        query = JobOrder.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'jor_number': 'required|integer|min:0', 'name_of_jo': 'required|string|max:255', 'job_title': 'required|string|max:255', 'funding': 'required|string|max:255', 'basic_pay': 'required|numeric|min:0', 'disbursement_type': 'required|string|in:CASH,ATM', 'status': 'string|in:active,inactive'})
        job_order = await JobOrder.create(validated)
        return response.json(job_order, 201)

    @staticmethod
    async def show(request, response):
        job_order = await JobOrder.find_or_fail(request.route('id'))
        return response.json(job_order)

    @staticmethod
    async def update(request, response):
        job_order = await JobOrder.find_or_fail(request.route('id'))
        validated = await request.validate({'jor_number': 'integer|min:0', 'name_of_jo': 'string|max:255', 'job_title': 'string|max:255', 'funding': 'string|max:255', 'basic_pay': 'numeric|min:0', 'disbursement_type': 'string|in:CASH,ATM', 'status': 'string|in:active,inactive'})
        await job_order.update(validated)
        return response.json(job_order)

    @staticmethod
    async def destroy(request, response):
        job_order = await JobOrder.find_or_fail(request.route('id'))
        await job_order.delete()
        return response.json({'message': "Job order deleted successfully"})

    @staticmethod
    async def summary(request, response):
        active_orders = await JobOrder.where('status', 'active').get()
        inactive_count = await JobOrder.where('status', 'inactive').count()

        def _number(value):
            return float(value or 0)

        total_cash = sum(1 for order in active_orders if order.disbursement_type == 'CASH')
        total_atm = sum(1 for order in active_orders if order.disbursement_type == 'ATM')
        total_basic_pay = sum(_number(order.basic_pay) for order in active_orders)
        total_sss = sum(_number(order.sss_amount) for order in active_orders)
        total_hdmf_premium = sum(_number(order.hdmf_premium) for order in active_orders)
        total_hdmf_mpl = sum(_number(order.hdmf_mpl) for order in active_orders)
        total_calamity_loan = sum(_number(order.calamity_loan) for order in active_orders)
        total_deductions = total_sss + total_hdmf_premium + total_hdmf_mpl + total_calamity_loan
        funding_breakdown = {}
        group_breakdown = {}
        for order in active_orders:
            funding = '' if order.funding is None else str(order.funding)
            group = '' if order.jor_pyrl_group is None else str(order.jor_pyrl_group)
            funding_breakdown.setdefault(funding, {'count': 0, 'total_pay': 0})
            funding_breakdown[funding]['count'] += 1
            funding_breakdown[funding]['total_pay'] += _number(order.basic_pay)
            group_breakdown[group] = group_breakdown.get(group, 0) + 1

        return response.json({
            'total_active': len(active_orders),
            'total_inactive': inactive_count,
            'total_atm': total_atm,
            'total_cash': total_cash,
            'total_basic_pay': total_basic_pay,
            'total_sss': total_sss,
            'total_hdmf_premium': total_hdmf_premium,
            'total_hdmf_mpl': total_hdmf_mpl,
            'total_calamity_loan': total_calamity_loan,
            'total_deductions': total_deductions,
            'net_pay': total_basic_pay - total_deductions,
            'funding_breakdown': funding_breakdown,
            'group_breakdown': group_breakdown,
        })

    @staticmethod
    async def byGroup(request, response):
        group = request.route('group')
        orders = await JobOrder.where('jor_pyrl_group', group).where('status', 'active').order_by('jor_number').get()
        return response.json(orders)

    @staticmethod
    async def appointments(request, response):
        orders = await JobOrder.query().where_not_null('appointment_order').order_by('appointment_order').get()
        return response.json(orders)



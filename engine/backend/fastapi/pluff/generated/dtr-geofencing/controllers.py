# ARKZEN GENERATED CONTROLLERS: dtr-geofencing
from pluff.runtime import *
from .models import Employee, TimeRecord, DtrSetting
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class EmployeeController:
    @staticmethod
    async def index(request, response):
        query = Employee.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def show(request, response):
        employee = await Employee.find_or_fail(request.route('id'))
        return response.json(employee)


class TimeRecordController:
    @staticmethod
    async def index(request, response):
        query = TimeRecord.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def my_records(request, response):
        employee_id = request.route('employee_id')
        records = TimeRecord.conn().select(
            f'SELECT * FROM {qi(TimeRecord.table)} WHERE {qi("employee_id")} = :employee_id '
            f'ORDER BY {qi("timestamp")} DESC LIMIT 50',
            {'employee_id': employee_id},
        )
        for record in records:
            for column in ('created_at', 'updated_at', 'timestamp'):
                if record.get(column) is not None:
                    record[column] = to_iso_micro(record[column])
            record['employee'] = await Employee.find(record['employee_id'])
        return response.json(records)

    @staticmethod
    async def check_in(request, response):
        import math

        employee_id = request.input('employee_id')
        latitude = request.input('latitude')
        longitude = request.input('longitude')
        notes = request.input('notes')

        setting = await DtrSetting.where('key', 'geofencing_enabled').first()
        geofencing_enabled = setting is not None and setting.value == 'true'
        within_geofence = True

        if geofencing_enabled and latitude is not None and longitude is not None:
            office_latitude_setting = await DtrSetting.where('key', 'office_latitude').first()
            office_longitude_setting = await DtrSetting.where('key', 'office_longitude').first()
            radius_setting = await DtrSetting.where('key', 'geofence_radius_meters').first()
            office_latitude = float(office_latitude_setting.value if office_latitude_setting else 0)
            office_longitude = float(office_longitude_setting.value if office_longitude_setting else 0)
            radius = float(radius_setting.value if radius_setting else 0)

            earth_radius = 6371000
            lat1 = math.radians(office_latitude)
            lon1 = math.radians(office_longitude)
            lat2 = math.radians(float(latitude))
            lon2 = math.radians(float(longitude))
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
            distance = earth_radius * 2 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))

            within_geofence = distance <= radius
            if not within_geofence:
                return response.json({
                    'error': 'Geofence violation',
                    'message': f'You must be within {js_str(radius)} meters of the office to check in.',
                    'distance': round(distance, 1),
                }, 403)

        record = await TimeRecord.create({
            'employee_id': employee_id,
            'type': 'in',
            'timestamp': now(),
            'latitude': latitude,
            'longitude': longitude,
            'within_geofence': within_geofence,
            'notes': notes,
        })
        record.employee = await Employee.find(employee_id)
        return response.json({
            'success': True,
            'record': record,
            'within_geofence': within_geofence,
            'geofencing_enabled': geofencing_enabled,
        })

    @staticmethod
    async def check_out(request, response):
        import math

        employee_id = request.input('employee_id')
        latitude = request.input('latitude')
        longitude = request.input('longitude')
        notes = request.input('notes')

        setting = await DtrSetting.where('key', 'geofencing_enabled').first()
        geofencing_enabled = setting is not None and setting.value == 'true'
        within_geofence = True

        if geofencing_enabled and latitude is not None and longitude is not None:
            office_latitude_setting = await DtrSetting.where('key', 'office_latitude').first()
            office_longitude_setting = await DtrSetting.where('key', 'office_longitude').first()
            radius_setting = await DtrSetting.where('key', 'geofence_radius_meters').first()
            office_latitude = float(office_latitude_setting.value if office_latitude_setting else 0)
            office_longitude = float(office_longitude_setting.value if office_longitude_setting else 0)
            radius = float(radius_setting.value if radius_setting else 0)

            earth_radius = 6371000
            lat1 = math.radians(office_latitude)
            lon1 = math.radians(office_longitude)
            lat2 = math.radians(float(latitude))
            lon2 = math.radians(float(longitude))
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
            distance = earth_radius * 2 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))

            within_geofence = distance <= radius
            if not within_geofence:
                return response.json({
                    'error': 'Geofence violation',
                    'message': f'You must be within {js_str(radius)} meters of the office to check out.',
                    'distance': round(distance, 1),
                }, 403)

        record = await TimeRecord.create({
            'employee_id': employee_id,
            'type': 'out',
            'timestamp': now(),
            'latitude': latitude,
            'longitude': longitude,
            'within_geofence': within_geofence,
            'notes': notes,
        })
        record.employee = await Employee.find(employee_id)
        return response.json({
            'success': True,
            'record': record,
            'within_geofence': within_geofence,
            'geofencing_enabled': geofencing_enabled,
        })


class DtrSettingController:
    @staticmethod
    async def index(request, response):
        query = DtrSetting.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def toggle_geofencing(request, response):
        enabled_value = request.input('enabled')
        enabled = bool(enabled_value) and enabled_value != '0'
        await DtrSetting.update_or_create(
            {'key': 'geofencing_enabled'},
            {'value': 'true' if enabled else 'false'},
        )
        return response.json({'success': True, 'geofencing_enabled': enabled_value})

    @staticmethod
    async def update_office(request, response):
        latitude = request.input('lat')
        longitude = request.input('lng')
        radius = request.input('radius')
        await DtrSetting.update_or_create(
            {'key': 'office_latitude'},
            {'value': '' if latitude is None else str(latitude)},
        )
        await DtrSetting.update_or_create(
            {'key': 'office_longitude'},
            {'value': '' if longitude is None else str(longitude)},
        )
        await DtrSetting.update_or_create(
            {'key': 'geofence_radius_meters'},
            {'value': '' if radius is None else str(radius)},
        )
        return response.json({'success': True})



# ARKZEN GENERATED MODELS: dtr-geofencing (FastAPI). Do not edit.
from pluff.runtime import *

class Employee(Model):
    table = "dtr_geofencing_employees"
    connection_name = "dtr-geofencing"
    fillable = ['name', 'email', 'avatar', 'is_active']
    casts = {'id': 'integer', 'is_active': 'boolean'}
    timestamps = True
    soft_deletes = False

    def employees(self):
        return self.has_many(TimeRecord, "employee_id")


class TimeRecord(Model):
    table = "dtr_geofencing_time_records"
    connection_name = "dtr-geofencing"
    fillable = ['employee_id', 'type', 'timestamp', 'latitude', 'longitude', 'within_geofence', 'notes']
    casts = {'id': 'integer', 'timestamp': 'datetime', 'latitude': 'decimal:2', 'longitude': 'decimal:2', 'within_geofence': 'boolean'}
    timestamps = True
    soft_deletes = False

    def employee(self):
        return self.belongs_to(Employee, "employee_id")


class DtrSetting(Model):
    table = "dtr_geofencing_dtr_settings"
    connection_name = "dtr-geofencing"
    fillable = ['key', 'value']
    casts = {'id': 'integer'}
    timestamps = True
    soft_deletes = False




import sqlite3
from datetime import datetime, timedelta
import random

# Define the database file name and create or connect to the SQLite database
# (if the file doesn't exist, it will be created automatically)
db_name = 'appliances.db'
conn = sqlite3.connect(db_name)

# Get a cursor
cursor = conn.cursor()

# Create table structure (if the table doesn't exist)
cursor.execute('''
CREATE TABLE IF NOT EXISTS Appliances (
    ID INTEGER NOT NULL,              -- Fixed ID for each appliance
    Name VARCHAR(255) NOT NULL,       -- Appliance name
    Owner VARCHAR(255),               -- Owner of the appliance
    Power_Consumption DECIMAL(10, 2) NOT NULL,  -- Power consumption per hour
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the record
)
''')

# Commit the table structure creation
conn.commit()

# Define a list of appliances and their fixed IDs
appliances = {
    1: "Fridge",
    2: "A/C",
    3: "Washer",
    4: "TV"
}

# Function to randomly generate power consumption
# (Assume fridge consumes between 0.05 and 0.2 kWh, A/C 0.5 to 2.0 kWh,
# washer 0.3 to 1.5 kWh, and TV 0.1 to 0.6 kWh)
def generate_power_consumption(appliance_name):
    if appliance_name == "Fridge":
        return round(random.uniform(0.05, 0.2), 2)
    elif appliance_name == "A/C":
        return round(random.uniform(0.5, 2.0), 2)
    elif appliance_name == "Washer":
        return round(random.uniform(0.3, 1.5), 2)
    elif appliance_name == "TV":
        return round(random.uniform(0.1, 0.6), 2)

# Generate data for each hour from September 18 to September 25
start_time = datetime(2024, 9, 18)
end_time = datetime(2024, 9, 25)

current_time = start_time
while current_time <= end_time:
    for appliance_id, appliance_name in appliances.items():
        # Generate random power consumption
        power_consumption = generate_power_consumption(appliance_name)

        # Insert data into the database
        cursor.execute('''
            INSERT INTO Appliances (ID, Name, Owner, Power_Consumption, Timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (appliance_id, appliance_name, "user1", power_consumption, current_time))

    # Increment by one hour in each loop iteration
    current_time += timedelta(hours=1)

# Commit the transaction
conn.commit()

# Close the database connection
conn.close()

print(f"Data has been inserted into the database file '{db_name}'.")

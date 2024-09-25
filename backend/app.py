from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import sqlite3

app = Flask(__name__)
CORS(app)
# Database file name
db_name = 'appliances.db'


# Get appliance usage data for a specific user, sorted in ascending order by timestamp
@app.route('/data', methods=['GET'])
def get_user_data():
    # Get the "user" parameter from the URL
    user = request.args.get('user')
    if not user:
        return jsonify({"error": "Missing user parameter"}), 400

    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()

        # Query appliance usage data for the specified user, sorted by timestamp in ascending order
        cursor.execute('''
        SELECT ID, Name, Power_Consumption, Timestamp 
        FROM Appliances 
        WHERE Owner = ? 
        ORDER BY Timestamp ASC
        ''', (user,))

        # Fetch all query results
        rows = cursor.fetchall()

        # If no data is found, return an empty array
        if not rows:
            return jsonify([])

        # Format the data as JSON
        result = []
        for row in rows:
            result.append({
                "ID": row[0],
                "Name": row[1],
                "Power_Consumption": row[2],
                "Timestamp": row[3]
            })

        # Return the JSON data
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Close the database connection
        if conn:
            conn.close()


# openai.api_key = "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"

openai.api_key = 'Your_Key'

def analyze_power_consumption(user):
    # Connect to the database and retrieve the user's data
    conn = sqlite3.connect('appliances.db')
    cursor = conn.cursor()

    # Query the user's power consumption data
    cursor.execute('''
    SELECT Name, Power_Consumption, Timestamp FROM Appliances WHERE Owner = ? ORDER BY Timestamp ASC
    ''', (user,))

    rows = cursor.fetchall()
    conn.close()

    # If no data is found, return a message
    if not rows:
        return "No power consumption data found for the user."

    # Process the data and format it for readability
    user_data = ""
    for row in rows:
        user_data += f"Appliance: {row[0]}, Total Consumption: {row[1]} kWh\n"

    # Define the prompt and minimize unnecessary details
    prompt = (f"Here is the user's total power consumption for their appliances in the past week. "
              f"Please analyze if there are any issues with their energy usage, and provide suggestions on how they can save energy:\n{user_data}")

    client = openai
    # Call the latest GPT API (gpt-4 or gpt-3.5-turbo)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=[
            {"role": "system", "content": "You are an expert in energy efficiency."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7
    )
    print(response)
    # Get GPT's response
    choices = response.choices
    if len(choices) > 0:
        answer = choices[0].message.content.strip()
    else:
        answer = "Sorry, I couldn't process the energy usage data."
    return answer


# Define an API route to receive the request
@app.route('/analyze', methods=['GET'])
def analyze():
    user = request.args.get('user')

    if not user:
        return jsonify({"error": "Missing user parameter"}), 400

    # Analyze the user's power consumption data
    analysis = analyze_power_consumption(user)

    # Return the analysis result
    return jsonify({"analysis": analysis})


# Start the Flask application
if __name__ == '__main__':
    app.run(debug=True)

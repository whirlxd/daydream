import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, GEOCODER_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !GEOCODER_API_KEY) {
		return json({ error: 'Missing required environment variables' }, { status: 500 });
	}

	try {
		// Fetch approved events from Airtable
		const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/events?filterByFormula={triage_status}="Approved"`;
		const airtableResponse = await fetch(airtableUrl, {
			headers: {
				'Authorization': `Bearer ${AIRTABLE_API_KEY}`
			}
		});

		if (!airtableResponse.ok) {
			throw new Error(`Airtable API error: ${airtableResponse.status}`);
		}

		const airtableData = await airtableResponse.json();
		const events = airtableData.records;

		// Geocode each event location
		const locations = [];
		for (const event of events) {
			const { city, state, country, event_name } = event.fields;
			
			if (!city || !event_name) continue;

			// Build address string
			const addressParts = [city, state, country].filter(Boolean);
			const address = addressParts.join(', ');

			try {
				const geocodeUrl = `https://geocoder.hackclub.com/v1/geocode?address=${encodeURIComponent(address)}&key=${GEOCODER_API_KEY}`;
				const geocodeResponse = await fetch(geocodeUrl);

				if (geocodeResponse.ok) {
					const geocodeData = await geocodeResponse.json();
					locations.push({
						lat: geocodeData.lat,
						lng: geocodeData.lng,
						event_name,
						city,
						state,
						country
					});
				}
			} catch (error) {
				console.error(`Failed to geocode ${address}:`, error);
			}
		}

		return json(locations);
	} catch (error) {
		console.error('Failed to fetch map data:', error);
		return json({ error: 'Failed to fetch map data' }, { status: 500 });
	}
}

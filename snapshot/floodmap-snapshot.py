#!/usr/bin/env python3
import urllib.request

site_keys = {
    'batonrouge': 'cj6wnjoyd1ee238o3n9wbuhr5',
    'beaumont': 'cj6wnis8c184t2wuhnxnqdwco',
    'galveston': 'cj6wngom11diq32rp0exejr1l',
    'houston': 'cj6v4db3r0wpt2wrp4ih050r5',
    'i45corridor': 'cj6wnkm0k1fg733s66fbr8wmc',
    'lakecharles': 'cj6wnk4ir1djx32rpvyugjg4x',
    'neworleans': 'cj6wnkash174t2qtbna0qkyuy',
    'tampa': 'cj7cts9mp02d32xmtanabe06n',
    'pensacola': 'cj7cts0t802hw2qlxh0e7n0wp',
    'palmbeach': 'cj7ctrqlx028r2wnpeubytt6m',
    'orlando': 'cj7ctreuo02cx2ppjg9wxcgv6',
    'miami': 'cj7ctr3ov025f2qnpmgly9829',
    'fortmyers': 'cj7ctqfa5027p2xlxpzbbyq5e',

}

base = 'https://api.mapbox.com/datasets/v1/tailwindlabs/{}/features'
token = 'sk.eyJ1IjoidGFpbHdpbmRsYWJzIiwiYSI6ImNqNnY0cGN2MzEwM3EzMnBkNHM3OWoxaWgifQ.3rwB8LW4khqcDoEekNCbTg'

# Get the archives
for key in site_keys.keys():

    # Get and save the file
    base_this = base.format(site_keys[key])
    try:
        urllib.request.urlretrieve('{}?access_token={}'.format(base_this, token), key + '.geojson')
    except urllib.error.URLError as e:
        print('Error: ' + e.reason)

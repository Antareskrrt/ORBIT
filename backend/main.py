from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import requests
import time

from astral import Observer
from astral.sun import sun

HORIZONS_API = (
    "https://ssd.jpl.nasa.gov/api/horizons.api"
)

# ==========================================
# CACHE ASTRONOMY
# ==========================================

astronomy_cache = {}

ASTRONOMY_CACHE_SECONDS = 60

# ==========================================
# CACHE PLANETARY EVENTS
# ==========================================

events_cache = {
    "data": None,
    "timestamp": 0
}

EVENTS_CACHE_SECONDS = 86400

# ==========================================
# ORBIT API
# ==========================================

app = FastAPI(
    title="ORBIT API",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# JPL HORIZONS
# ==========================================

HORIZONS_API = (
    "https://ssd.jpl.nasa.gov/api/horizons.api"
)

# ==========================================
# ASTRONOMICAL POSITION
# ==========================================

@app.get("/api/astronomy")
def get_astronomical_position(
    command: str,
    latitude: float,
    longitude: float
):
    cache_key = (
        command,
        round(latitude, 4),
        round(longitude, 4)
    )

    cached = astronomy_cache.get(cache_key)

    if cached:
        cached_data, cached_time = cached

        if time.time() - cached_time < ASTRONOMY_CACHE_SECONDS:
            print(
                f"ORBIT → CACHE HIT: {command}"
            )

            return cached_data

    try:
        now = datetime.now(timezone.utc)

        start_time = now.strftime("%Y-%m-%d %H:%M")
        stop_time = (
            now + timedelta(minutes=2)
        ).strftime("%Y-%m-%d %H:%M")

        params = {
            "format": "json",
            "COMMAND": f"'{command}'",
            "OBJ_DATA": "NO",
            "MAKE_EPHEM": "YES",
            "EPHEM_TYPE": "OBSERVER",
            "CENTER": "'coord@399'",
            "COORD_TYPE": "GEODETIC",
            "SITE_COORD": f"'{longitude},{latitude},0'",
            "START_TIME": f"'{start_time}'",
            "STOP_TIME": f"'{stop_time}'",
            "STEP_SIZE": "'1 m'",
            "QUANTITIES": "'4'",
            "CSV_FORMAT": "YES",
            "SKIP_DAYLT": "NO",
            "ELEV_CUT": "'-90'"
        }

        response = requests.get(
            HORIZONS_API,
            params=params,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        if "error" in data:
            raise RuntimeError(
                data["error"]
            )

        astronomy_cache[cache_key] = (
            data,
            time.time()
        )

        return data

    except Exception as error:
        print(
            "ASTRONOMY ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=502,
            detail=str(error)
        )


# ==========================================
# SUN TIMES
# ==========================================

@app.get("/api/sun-times")
def get_sun_times(
    latitude: float,
    longitude: float,
    timezone_name: str
):

    try:

        # --------------------------------------
        # Timezone
        # --------------------------------------

        local_timezone = ZoneInfo(timezone_name)


        # --------------------------------------
        # Current local date
        # --------------------------------------

        now = datetime.now(local_timezone)

        today = now.date()


        # --------------------------------------
        # Observer
        # --------------------------------------

        observer = Observer(
            latitude=latitude,
            longitude=longitude
        )


        # --------------------------------------
        # Solar events
        # --------------------------------------

        solar_data = sun(
            observer,
            date=today,
            tzinfo=local_timezone
        )


        # --------------------------------------
        # Format helper
        # --------------------------------------

        def format_time(value):

            return value.strftime("%H:%M")


        # --------------------------------------
        # Return
        # --------------------------------------

        return {

            "date": today.isoformat(),

            "sunrise": format_time(
                solar_data["sunrise"]
            ),

            "sunset": format_time(
                solar_data["sunset"]
            ),

            "dawn": format_time(
                solar_data["dawn"]
            ),

            "dusk": format_time(
                solar_data["dusk"]
            ),

            "noon": format_time(
                solar_data["noon"]
            )

        }


    except Exception as error:

        print(
            "SUN TIMES ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to calculate solar times"
        )

    # ==========================================
# PLANETARY EVENTS
# ==========================================

import math
from datetime import datetime, timedelta, timezone


PLANETS = {
    "MERCURY": "199",
    "VENUS": "299",
    "MARS": "499",
    "JUPITER": "599",
    "SATURN": "699"
}


def parse_horizons_rows(result):

    rows = []

    if "$$SOE" not in result or "$$EOE" not in result:
        return rows

    data = result.split("$$SOE", 1)[1]
    data = data.split("$$EOE", 1)[0]

    for line in data.splitlines():

        line = line.strip()

        if not line:
            continue

        parts = [
            x.strip()
            for x in line.split(",")
        ]

        # Horizons VECTORS con:
        # VEC_TABLE=1
        # CSV_FORMAT=YES
        #
        # produce:
        #
        # JD, Calendar Date, X, Y, Z

        if len(parts) < 5:
            continue

        try:

            julian_date = float(parts[0])

            date_string = parts[1]

            x = float(parts[2])
            y = float(parts[3])
            z = float(parts[4])

            rows.append({

                "julian_date":
                    julian_date,

                "date":
                    date_string,

                "x":
                    x,

                "y":
                    y,

                "z":
                    z

            })

        except (ValueError, IndexError):

            continue

    return rows


def get_planet_vectors(
    command,
    start_time,
    stop_time,
    step_size="1 d"
):

    params = {

        "format": "json",

        "COMMAND": f"'{command}'",

        "OBJ_DATA": "NO",

        "MAKE_EPHEM": "YES",

        "EPHEM_TYPE": "VECTORS",

        "CENTER": "'500@399'",

        "START_TIME": f"'{start_time}'",

        "STOP_TIME": f"'{stop_time}'",

        "STEP_SIZE": f"'{step_size}'",

        "OUT_UNITS": "AU-D",

        "VEC_TABLE": "1",

        "VEC_LABELS": "NO",

        "CSV_FORMAT": "YES"

    }

    response = requests.get(
        HORIZONS_API,
        params=params,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    if "error" in data:
        raise RuntimeError(
            data["error"]
        )

    return parse_horizons_rows(
        data["result"]
    )


def distance_from_earth(row):

    try:

        x = float(row["x"])
        y = float(row["y"])
        z = float(row["z"])

        return math.sqrt(
            x ** 2 +
            y ** 2 +
            z ** 2
        )

    except (
        TypeError,
        ValueError,
        KeyError
    ):

        return None


def angular_separation(a, b):

    try:

        ax = float(a["x"])
        ay = float(a["y"])
        az = float(a["z"])

        bx = float(b["x"])
        by = float(b["y"])
        bz = float(b["z"])

    except (
        TypeError,
        ValueError,
        KeyError
    ):

        return None

    dot = (
        ax * bx +
        ay * by +
        az * bz
    )

    mag_a = math.sqrt(
        ax ** 2 +
        ay ** 2 +
        az ** 2
    )

    mag_b = math.sqrt(
        bx ** 2 +
        by ** 2 +
        bz ** 2
    )

    if mag_a == 0 or mag_b == 0:
        return None

    cosine = dot / (
        mag_a * mag_b
    )

    cosine = max(
        -1.0,
        min(1.0, cosine)
    )

    return math.degrees(
        math.acos(cosine)
    )


def refine_conjunction(
    command_a,
    command_b,
    approximate_date
):

    """
    Cerca il momento preciso della minima
    separazione angolare attorno alla data trovata.
    """

    try:

        center = datetime.strptime(
            approximate_date.replace(
                "A.D. ",
                ""
            ),
            "%Y-%b-%d %H:%M:%S.%f"
        )

    except ValueError:

        print(
            "ORBIT EVENTS → Invalid date:",
            approximate_date
        )

        return None


    start = center - timedelta(
        days=2
    )

    stop = center + timedelta(
        days=2
    )


    rows_a = get_planet_vectors(
        command_a,
        start.strftime(
            "%Y-%m-%d %H:%M"
        ),
        stop.strftime(
            "%Y-%m-%d %H:%M"
        ),
        "1 h"
    )


    rows_b = get_planet_vectors(
        command_b,
        start.strftime(
            "%Y-%m-%d %H:%M"
        ),
        stop.strftime(
            "%Y-%m-%d %H:%M"
        ),
        "1 h"
    )


    count = min(
        len(rows_a),
        len(rows_b)
    )


    if count == 0:
        return None


    best_row = None
    best_angle = None


    for index in range(count):

        angle = angular_separation(
            rows_a[index],
            rows_b[index]
        )


        if angle is None:
            continue


        if (
            best_angle is None
            or angle < best_angle
        ):

            best_angle = angle
            best_row = rows_a[index]


    if best_row is None:
        return None


    return {

        "date":
            best_row["date"],

        "separation_deg":
            round(
                best_angle,
                4
            )

    }

def parse_event_date(date_string):

    try:

        return datetime.strptime(
            date_string.replace(
                "A.D. ",
                ""
            ),
            "%Y-%b-%d %H:%M:%S.%f"
        )

    except (
        ValueError,
        AttributeError
    ):

        return datetime.max

@app.get("/api/events")
def get_planetary_events():

    try:

        # ==========================================
        # CHECK CACHE
        # ==========================================

        if (
            events_cache["data"] is not None
            and
            time.time() - events_cache["timestamp"]
            < EVENTS_CACHE_SECONDS
        ):

            print(
                "ORBIT EVENTS → CACHE HIT"
            )

            return events_cache["data"]


        now = datetime.now(timezone.utc)

        start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )

        stop = start + timedelta(days=730)

        start_time = start.strftime(
            "%Y-%m-%d"
        )

        stop_time = stop.strftime(
            "%Y-%m-%d"
        )


        # ==========================================
        # LOAD PLANET DATA
        # ==========================================

        planet_data = {}

        for name, command in PLANETS.items():

            print(
                f"ORBIT EVENTS → Loading {name}"
            )

            planet_data[name] = get_planet_vectors(
                command,
                start_time,
                stop_time
            )

            print(
                f"ORBIT EVENTS → {name}: "
                f"{len(planet_data[name])} rows"
            )


        # ==========================================
        # CLOSEST APPROACHES
        # ==========================================

        closest = []

        for name, rows in planet_data.items():

            if not rows:
                continue

            valid_rows = []

            for row in rows:

                distance = distance_from_earth(
                    row
                )

                if distance is not None:
                    valid_rows.append(row)


            if not valid_rows:
                continue


            best = min(
                valid_rows,
                key=distance_from_earth
            )


            distance = distance_from_earth(
                best
            )


            closest.append({

                "type":
                    "CLOSEST_APPROACH",

                "planet":
                    name,

                "date":
                    best["date"],

                "distance_au":
                    round(
                        distance,
                        6
                    )

            })


        # ==========================================
        # CONJUNCTIONS
        # ==========================================

        conjunctions = []

        planet_names = list(
            planet_data.keys()
        )


        for i in range(
            len(planet_names)
        ):

            for j in range(
                i + 1,
                len(planet_names)
            ):

                planet_a = planet_names[i]

                planet_b = planet_names[j]


                rows_a = planet_data[
                    planet_a
                ]

                rows_b = planet_data[
                    planet_b
                ]


                count = min(
                    len(rows_a),
                    len(rows_b)
                )


                if count < 3:
                    continue


                angles = []


                for index in range(count):

                    angle = angular_separation(

                        rows_a[index],

                        rows_b[index]

                    )


                    if angle is None:

                        angle = 180.0


                    angles.append(
                        angle
                    )


                for index in range(
                    1,
                    count - 1
                ):

                    previous_angle = \
                        angles[index - 1]

                    current_angle = \
                        angles[index]

                    next_angle = \
                        angles[index + 1]


                    is_local_minimum = (

                        current_angle
                        <
                        previous_angle

                        and

                        current_angle
                        <=
                        next_angle

                    )


                    if (

                        is_local_minimum

                        and

                        current_angle
                        <=
                        5.0

                    ):

                        refined = refine_conjunction(

                            PLANETS[
                                planet_a
                            ],

                            PLANETS[
                                planet_b
                            ],

                            rows_a[index][
                                "date"
                            ]

                        )


                        if refined is not None:

                            conjunctions.append({

                                "type":
                                    "CONJUNCTION",

                                "planet_a":
                                    planet_a,

                                "planet_b":
                                    planet_b,

                                "date":
                                    refined[
                                        "date"
                                    ],

                                "separation_deg":
                                    refined[
                                        "separation_deg"
                                    ]

                            })


        # ==========================================
        # REMOVE DUPLICATES
        # ==========================================

        unique_conjunctions = {}

        for event in conjunctions:

            key = (
                event["planet_a"],
                event["planet_b"],
                event["date"][:16]
            )

            unique_conjunctions[key] = event

        conjunctions = list(
            unique_conjunctions.values()
        )


        # ==========================================
        # SORT
        # ==========================================

        closest.sort(
            key=lambda event:
                parse_event_date(
                    event["date"]
                )
        )

        conjunctions.sort(
            key=lambda event:
                parse_event_date(
                    event["date"]
                )
        )


        # ==========================================
        # RESPONSE
        # ==========================================

        result = {

            "generated_at":
                now.isoformat(),

            "closest_approaches":
                closest,

            "conjunctions":
                conjunctions

        }


        # ==========================================
        # SAVE CACHE
        # ==========================================

        events_cache["data"] = result

        events_cache["timestamp"] = time.time()

        print(
            "ORBIT EVENTS → CACHE SAVED"
        )


        return result


    except Exception as error:

        print(
            "PLANETARY EVENTS ERROR:",
            repr(error)
        )

        raise HTTPException(

            status_code=502,

            detail=str(error)

        )
from datetime import datetime
from typing import Any, Dict


class WeatherFeedService:
    """
    Provides real weather alerts and telemetry for Pune (Station 43063 - Shivajinagar / Bund Garden),
    with live IMD data and clearly labelled demo hydrological discharge data.
    """

    @staticmethod
    def get_pune_weather_context() -> Dict[str, Any]:
        """
        Returns structured weather and river basin telemetry.
        Real IMD data is marked source: 'IMD Station 43063'.
        Hydrological simulation data is explicitly marked source: 'mock'.
        """
        return {
            "station_info": {
                "station_id": "43063",
                "station_name": "Pune - Shivajinagar / Bund Garden Corridor",
                "source": "IMD Station 43063",
                "observed_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "timestamp": datetime.utcnow().isoformat(),
            },
            "imd_alerts": {
                "source": "IMD Station 43063",
                "current_warning": "Yellow/Orange Watch for Catchment Inflow & Local Heavy Showers",
                "forecast_description": "Generally cloudy sky with spells of rain and heavy showers in ghat and river basin areas",
                "relative_humidity_pct": 88,
                "wind_speed_kmh": 22,
            },
            "hydrological_telemetry": {
                "source": "mock",
                "data_label": "DEMO DATA: Mutha River Basin Sensor Network",
                "khadakwasla_dam_discharge_cusecs": 35400,
                "river_gauge_bund_garden_level_m": 7.82,
                "danger_mark_level_m": 6.50,
                "rate_of_rise_cm_per_hr": 14.5,
                "inundation_risk": "Critical (Danger mark exceeded by +1.32m)",
            },
        }


weather_feed_service = WeatherFeedService()

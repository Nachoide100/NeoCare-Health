from datetime import date

def week_str_to_range(week_str: str):
    """
    Convierte 'YYYY-WW' en (start_date, end_date) donde start_date es lunes
    y end_date es domingo (ambos objetos datetime.date).

    Acepta formato EXACTO: YYYY-WWW (con la W incluida).
    """

    if not week_str or "-W" not in week_str:
        raise ValueError("Formato inválido, se espera 'YYYY-WW'")

    try:
        year_str, week_str_num = week_str.split("-W")
        year = int(year_str)
        week = int(week_str_num)
    except:
        raise ValueError("Año o número de semana no son enteros")

    try:
        start = date.fromisocalendar(year, week, 1)  # lunes
        end = date.fromisocalendar(year, week, 7)    # domingo
    except Exception as exc:
        raise ValueError(f"Semana inválida: {exc}") from exc

    return start, end


import random
import string

def generate_fee_barcode(student_id: int, month: int, year: int) -> str:
    """
    Generate unique barcode for fee payment
    Format: FEE + STUDENT_ID(8) + MONTH(2) + YEAR(4) + RANDOM(4)
    """
    prefix = "FEE"
    sid_str = str(student_id).zfill(8)
    month_str = str(month).zfill(2)
    year_str = str(year)
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}{sid_str}{month_str}{year_str}{random_str}"

def generate_receipt_number() -> str:
    """
    Generate unique receipt number
    Format: RCP + YYYYMMDD + RANDOM(5)
    """
    import datetime
    prefix = "RCP"
    date_str = datetime.datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.digits, k=5))
    return f"{prefix}{date_str}{random_str}"

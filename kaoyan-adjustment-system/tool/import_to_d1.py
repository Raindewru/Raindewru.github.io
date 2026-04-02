import csv

CSV_PATH = r"C:\Users\WYL21\Desktop\tj.csv"
SQL_OUTPUT = r"insert_no_transaction.sql"

def escape_sql(s):
    if s is None:
        return "NULL"
    s = str(s).replace("'", "''")
    return f"'{s}'"

def safe_int(val):
    if val is None or val == '' or val == '*':
        return "NULL"
    try:
        return str(int(float(val)))
    except:
        return "NULL"

def main():
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as infile, \
         open(SQL_OUTPUT, 'w', encoding='utf-8') as outfile:
        
        reader = csv.reader(infile)
        header = next(reader)  # 跳过表头
        print(f"表头: {header}")

        count = 0
        for row in reader:
            if len(row) != 12:
                print(f"警告: 第 {count+1} 行字段数 {len(row)}，跳过")
                continue
            year = safe_int(row[0])
            school = escape_sql(row[1])
            region = escape_sql(row[2])
            school_category = escape_sql(row[3])
            college = escape_sql(row[4])
            major_code = escape_sql(row[5])
            major_name = escape_sql(row[6])
            study_form = escape_sql(row[7])
            student_id = escape_sql(row[8])
            total_score = safe_int(row[9])
            first_choice = escape_sql(row[10])
            remark = escape_sql(row[11])

            sql = f"INSERT INTO students (year, school, region, school_category, college, major_code, major_name, study_form, student_id, total_score, first_choice_school, remark) VALUES ({year}, {school}, {region}, {school_category}, {college}, {major_code}, {major_name}, {study_form}, {student_id}, {total_score}, {first_choice}, {remark});\n"
            outfile.write(sql)
            count += 1
            # 每 10000 条打印一次进度
            if count % 10000 == 0:
                print(f"已生成 {count} 条 INSERT")
        
        print(f"SQL 文件已生成: {SQL_OUTPUT}")
        print(f"共 {count} 条 INSERT 语句")

if __name__ == "__main__":
    main()
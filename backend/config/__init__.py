import pymysql

# Mock version to satisfy Django's requirements
pymysql.version_info = (2, 2, 2, "final", 0)
pymysql.install_as_MySQLdb()

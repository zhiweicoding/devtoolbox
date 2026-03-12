# 大数据平台组件恢复与学习说明

## 1. 先用一句话讲清楚这套架构

这套大数据平台可以按 **存储层 → 计算层 → 查询层 → 调度层** 来理解：

- **HDFS**：分布式存储，负责承载大规模离线数据
- **Hive**：基于 HDFS 的离线数仓与 SQL 分析组件，适合批处理
- **Spark**：通用计算引擎，适合 ETL、离线计算、部分实时处理
- **Kudu**：支持随机读写和实时更新的列式存储，适合近实时分析
- **Impala**：面向分析型场景的 MPP SQL 查询引擎，适合秒级报表查询
- **Oozie**：老牌任务调度组件，用来按时间或依赖关系调度任务

可以直接记这几个关系：

1. **HDFS = 大数据的基础硬盘**
2. **Hive = 传统离线 SQL 数仓**
3. **Spark = 新一代通用计算引擎**
4. **Kudu = 支持实时更新的数据存储**
5. **Impala = 面向业务查询的秒级分析引擎**
6. **Oozie = 老式任务调度器**

---

## 2. 常见组合

### 离线数仓组合

- **HDFS + Hive**
- 场景：T+1 报表、夜间批处理、历史数据分析

### 实时/准实时分析组合

- **Kudu + Spark + Impala**
- 场景：实时明细查询、运营看板、近实时数据分析

### 调度层

- 传统方案：**Oozie**
- 当前更常见替代方案：**Airflow**

---

## 3. 恢复平台时应该先恢复谁

如果现在要恢复一个较完整的大数据平台，推荐按照下面顺序：

1. **基础环境**
   - JDK
   - SSH 免密
   - 时钟同步
   - 主机名 / hosts
2. **分布式存储**
   - HDFS
3. **离线数仓**
   - Hive（依赖 Metastore，通常还需要 MySQL/PostgreSQL）
4. **计算引擎**
   - Spark
5. **实时存储**
   - Kudu
6. **交互式查询**
   - Impala
7. **任务调度**
   - Oozie

原因很简单：

- **HDFS 是底座**，很多组件都默认围绕它运转
- **Hive/Spark** 一般要先有存储和元数据服务
- **Impala/Kudu/Oozie** 更偏上层能力，后恢复更稳

---

## 4. 每个组件到底是干什么的

### 4.1 HDFS

**定位：** 分布式文件系统。  
**作用：** 存原始数据、明细数据、中间结果、离线数仓表数据。  
**典型进程：** NameNode、DataNode、SecondaryNameNode / JournalNode。  

**你要关注的点：**

- NameNode 是否正常启动
- DataNode 是否全部注册
- 副本数是否正常
- 磁盘空间是否足够

---

### 4.2 Hive

**定位：** 建在 HDFS 之上的离线数据仓库。  
**作用：** 用 SQL 管理大规模离线数据，适合批处理。  
**核心依赖：**

- HDFS
- Metastore
- 关系型数据库（MySQL / PostgreSQL）

**你要关注的点：**

- Metastore 是否正常
- 数据库连接是否正常
- Warehouse 路径是否正确
- Hive 能否正常建表、查表

---

### 4.3 Spark

**定位：** 通用计算引擎。  
**作用：** ETL、批处理、数据清洗、部分流处理。  
**运行模式：** Local、Standalone、YARN。  

**你要关注的点：**

- Spark 是跑在 Standalone 还是 YARN 上
- Driver / Executor 资源是否正常
- 是否能读写 HDFS / Hive

---

### 4.4 Kudu

**定位：** 面向分析场景、支持更新的列式存储。  
**作用：** 适合实时写入 + 快速查询的场景。  
**典型进程：** Master、Tablet Server。  

**你要关注的点：**

- Master 是否选主成功
- Tablet Server 是否全部注册
- 副本与 tablet 分布是否健康

---

### 4.5 Impala

**定位：** MPP SQL 查询引擎。  
**作用：** 提供秒级交互式查询能力，业务方常直接拿它出报表。  
**典型进程：** impalad、catalogd、statestored。  

**你要关注的点：**

- 元数据同步是否正常
- 是否能查 Hive 表 / Kudu 表
- 集群节点是否都在线

---

### 4.6 Oozie

**定位：** 工作流与任务调度系统。  
**作用：** 定时执行 Hive、Spark、Shell 等任务。  
**特点：** 老系统中比较常见，但新项目越来越多迁移到 Airflow。  

**你要关注的点：**

- Oozie Server 是否正常
- 依赖的数据库是否正常
- ShareLib 是否上传到 HDFS
- 任务定义和依赖路径是否有效

---

## 5. 恢复安装的实操建议

> 这里给的是“恢复思路”和“检查清单”，不是绑定某个发行版的死命令。  
> 如果你实际环境是 **CDH / Cloudera Manager**、**Ambari/HDP**、**手工部署 Apache 版**，安装路径和命令会有差异。

### 5.1 先确认环境类型

恢复前先确认你现在的平台属于哪一类：

1. **CDH / Cloudera Manager 管理**
2. **HDP / Ambari 管理**
3. **纯 Apache 手工安装**
4. **云厂商托管大数据平台**

这是第一步，因为：

- 如果是 **Cloudera Manager / Ambari**，最优先是恢复管理平台与数据库
- 如果是 **手工安装**，才需要分别恢复各组件配置和启动脚本

---

## 6. 安装 / 恢复顺序建议（通用版）

### 第一步：基础依赖

先准备：

- Linux 主机
- JDK 8/11（看组件版本要求）
- SSH 免密
- `/etc/hosts`
- NTP / chrony 时钟同步
- 磁盘挂载点
- 统一用户与目录权限

建议检查：

```bash
java -version
hostname
cat /etc/hosts
timedatectl
```

---

### 第二步：恢复 HDFS

**为什么先恢复 HDFS：** 因为 Hive、Spark 等很多链路都会先依赖它。

恢复重点：

- `core-site.xml`
- `hdfs-site.xml`
- NameNode 元数据目录
- DataNode 数据目录
- 副本数配置
- HA 场景下的 ZKFC / JournalNode

常见检查命令：

```bash
hdfs dfsadmin -report
hdfs fsck /
hdfs dfs -ls /
```

通过标准：

- NameNode 正常
- DataNode 全部存活
- HDFS 可读可写

---

### 第三步：恢复 Hive

恢复重点：

- Metastore 服务
- 元数据库（MySQL / PostgreSQL）
- `hive-site.xml`
- warehouse 路径
- 权限配置

常见检查项：

```bash
schematool -info -dbType mysql
hive -e 'show databases;'
beeline -u jdbc:hive2://<host>:10000/default -n hive
```

通过标准：

- Metastore 可连
- HiveServer2 可连
- 能正常建库建表查询

---

### 第四步：恢复 Spark

恢复重点：

- `spark-defaults.conf`
- `spark-env.sh`
- 是否接入 YARN
- 是否集成 Hive
- 历史服务是否可用

常见检查项：

```bash
spark-shell
pyspark
spark-sql -e 'show databases;'
```

通过标准：

- Spark 能启动
- 能读取 Hive 元数据
- 能读写 HDFS

---

### 第五步：恢复 Kudu

恢复重点：

- Kudu Master
- Kudu Tablet Server
- 副本数与 tablet 分布
- 与 Impala / Spark 的集成配置

常见检查项：

```bash
kudu cluster ksck <master_host:7051>
kudu master list <master_host:7051>
```

通过标准：

- Master/Tablet Server 正常注册
- 集群健康检查通过

---

### 第六步：恢复 Impala

恢复重点：

- catalogd
- statestored
- impalad
- Hive Metastore 连接
- Kudu 集成配置

常见检查项：

```bash
impala-shell -q 'show databases;'
impala-shell -q 'invalidate metadata;'
impala-shell -q 'show tables;'
```

通过标准：

- 能查询 Hive 表
- 能查询 Kudu 表
- 查询延迟正常

---

### 第七步：恢复 Oozie

恢复重点：

- Oozie Server
- Oozie DB
- ShareLib
- 与 HDFS / Hive / Spark 的连接

常见检查项：

```bash
oozie admin -status
oozie jobs -oozie http://<host>:11000/oozie -jobtype wf
```

通过标准：

- Oozie 服务正常
- 能提交工作流
- 定时任务能跑通

---

## 7. 一份最实用的学习顺序

如果你现在对这些组件“知道名字，但还没真正串起来”，建议这样学：

### 第一阶段：先建立全局理解

先搞懂下面四件事：

1. 数据存哪里？→ **HDFS / Kudu**
2. 数据怎么加工？→ **Hive / Spark**
3. 业务怎么查？→ **Impala**
4. 任务怎么定时跑？→ **Oozie**

### 第二阶段：先学最关键的 3 个

优先顺序建议：

1. **HDFS**
2. **Hive**
3. **Spark**

因为这三个是最容易形成“基础认知闭环”的。

### 第三阶段：再补实时分析链路

再学：

4. **Kudu**
5. **Impala**

### 第四阶段：最后学调度

6. **Oozie**

因为调度是把前面的东西串起来，不理解前面的组件，学调度会比较空。

---

## 8. 建议你重点掌握的知识点

### HDFS 要会的

- NameNode / DataNode 角色
- 文件写入流程
- 副本机制
- 常见故障：磁盘满、DataNode 掉线、块丢失

### Hive 要会的

- 内部表 / 外部表
- 分区表
- Metastore 的作用
- Hive 适合离线批处理，不适合高并发秒查

### Spark 要会的

- Driver / Executor
- Job / Stage / Task
- DataFrame / SQL
- Spark 和 Hive / HDFS 的关系

### Kudu 要会的

- 为什么它适合实时更新
- 和 HDFS/Hive 的差异
- 主键、分区、副本

### Impala 要会的

- 为什么它比 Hive 查得快
- 适合交互式分析
- 和 Kudu / Hive 的关系

### Oozie 要会的

- Coordinator / Workflow / Bundle 概念
- 如何调度 Hive / Spark / Shell 任务
- 为什么很多团队后面会迁移到 Airflow

---

## 9. 给别人讲的时候，可以直接这样说

我们的大数据平台可以拆成四层：

- **存储层**：HDFS 负责离线大规模存储，Kudu 负责可更新的实时分析存储
- **计算层**：Hive 负责传统离线 SQL，Spark 负责更灵活、更高性能的数据处理
- **查询层**：Impala 负责给业务提供秒级查询和报表能力
- **调度层**：Oozie 负责把 Hive、Spark 等任务按计划调度起来

如果是离线数仓，常见组合是 **HDFS + Hive**；如果是实时分析，常见组合是 **Kudu + Spark + Impala**。

---

## 10. 实际恢复时最容易踩的坑

1. **版本兼容性不一致**
   - Hadoop / Hive / Spark / Kudu / Impala 版本必须匹配
2. **元数据库没恢复好**
   - Hive Metastore、Oozie DB 经常是关键卡点
3. **配置文件丢失或路径错误**
   - 尤其是 warehouse、hdfs-site、core-site、catalog 配置
4. **权限问题**
   - HDFS 目录权限、系统用户权限、Kerberos/Ranger 权限
5. **依赖服务遗漏**
   - ZooKeeper、MySQL/PostgreSQL、YARN、Hive Metastore
6. **只恢复服务，没有做联通验证**
   - 服务能启动不等于链路可用，必须做端到端验证

---

## 11. 恢复完成后的最小验收清单

至少验证下面这些：

- HDFS 可读写
- Hive 可以建表、查表
- Spark 可以读写 Hive/HDFS
- Kudu 可以建表写入
- Impala 可以查 Hive / Kudu 表
- Oozie 可以成功调度一个简单工作流

建议做一个最小闭环测试：

1. 上传一份测试数据到 HDFS
2. 用 Hive 建外部表
3. 用 Spark 做一次 ETL
4. 把结果写入 Kudu 或 Hive
5. 用 Impala 查询结果
6. 用 Oozie 把这条链路调度起来

这样就不是“组件都亮了”，而是真正证明平台恢复可用。

---

## 12. 如果后续要继续补文档，优先补这几类

1. **当前环境属于哪种发行版（CDH / HDP / Apache）**
2. **当前集群节点清单**
3. **各组件安装目录 / 配置目录**
4. **关键端口清单**
5. **启动 / 停止命令**
6. **账号权限说明**
7. **故障排查 SOP**

---

## 13. 推荐后续拆分成的子文档

后面如果要把资料整理得更系统，建议拆成：

- `docs/hdfs-recovery-checklist.md`
- `docs/hive-install-and-metastore.md`
- `docs/spark-deployment-notes.md`
- `docs/kudu-impala-realtime-architecture.md`
- `docs/oozie-vs-airflow.md`

这样后面你在电脑上继续看时会更清晰。

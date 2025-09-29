use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use tracing::info;
use uuid::Uuid;
use chrono::Utc;
use crate::utils::{hash_password_with_user_id, generate_wallet};
use std::fs;
use url::Url;
use std::time::Duration;

pub type DbPool = Pool<Sqlite>;

// 使用内存数据库
// pub async fn create_pool() -> Result<DbPool, sqlx::Error> {
//     let pool = SqlitePoolOptions::new()
//         .max_connections(5)
//         .connect("sqlite::memory:")
//         .await?;
//     info!("Connected to in-memory database");
//     Ok(pool)
// }

// 使用文件数据库
pub async fn create_pool() -> Result<DbPool, sqlx::Error> {
    // 获取当前工作目录
    let current_dir = std::env::current_dir().expect("Failed to get current directory");
    // 构建data目录的绝对路径
    let data_dir = current_dir.join("data");
    // 创建data目录
    fs::create_dir_all(&data_dir).expect("Failed to create data directory");

    // 连接数据库，如果文件不存在会自动创建
    let database_path = data_dir.join("pickers-server.db");
    // Windows上需要 把 \ 替换成 /
    let url = Url::from_file_path(&database_path)
        .expect("Failed to convert path to URL");

    // 转换为 sqlite:// 格式
    let mut database_url = url.to_string().replace("file:///", "sqlite:///");
    database_url.push_str("?mode=rwc");

    println!("Database URL: {}", database_url);

    // 创建连接池
    let pool = SqlitePoolOptions::new()
        .max_connections(10) // 设置连接池大小
        .acquire_timeout(Duration::from_secs(15)) // 增加超时时间
        .connect(&database_url)
        .await?;
    info!("Connecting to database: {}", database_url);
    
    // let pool = SqlitePool::connect(database_url).await?;
    
    Ok(pool)
}

pub async fn init_database(pool: &DbPool) -> Result<(), sqlx::Error> {
    // 启用外键约束
    sqlx::query("PRAGMA foreign_keys = ON")
        .execute(pool)
        .await?;

    // 创建用户表
    // user_password 加密存储使用的 salt 是 user_id<UUID>字符串与"openpick"字符串的组合，这样使得每个用户的密码都有独立的加密salt，密码存储更加安全
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            user_id BLOB PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            user_name TEXT NOT NULL,
            user_password TEXT NOT NULL,
            user_type TEXT NOT NULL CHECK (user_type IN ('gen', 'dev')),
            private_key TEXT NOT NULL,
            wallet_address TEXT NOT NULL,
            premium_balance INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // 创建Picker表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS pickers (
            picker_id BLOB PRIMARY KEY,
            dev_user_id BLOB NOT NULL,
            alias TEXT NOT NULL,
            description TEXT NOT NULL,
            price INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            file_path TEXT NOT NULL,
            version TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
            download_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (dev_user_id) REFERENCES users (user_id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // 创建订单表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS orders (
            order_id BLOB PRIMARY KEY,
            status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'expired')),
            user_id BLOB NOT NULL,
            picker_id BLOB NOT NULL,
            pay_type TEXT NOT NULL CHECK (pay_type IN ('wallet', 'premium')),
            amount INTEGER NOT NULL,
            tx_hash TEXT,
            created_at TEXT NOT NULL,
            expires_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
            FOREIGN KEY (picker_id) REFERENCES pickers (picker_id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await?;

    // 创建索引
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_pickers_status ON pickers (status)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_orders_picker_id ON orders (picker_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_orders_pay_type ON orders (pay_type)")
        .execute(pool)
        .await?;

    insert_test_data(pool).await?;
    Ok(())
}

/// 插入测试数据到数据库，默认执行，自动被调用
pub async fn insert_test_data(pool: &DbPool) -> Result<(), sqlx::Error> {
    info!("Inserting test data...");

    // 使用固定的UUID以确保幂等性
    let test_user_id = Uuid::parse_str("550e8400-e29b-41d4-a716-446655440000").unwrap();
    let test_picker_id = Uuid::parse_str("550e8400-e29b-41d4-a716-446655440001").unwrap();
    let test_order_id = Uuid::parse_str("550e8400-e29b-41d4-a716-446655440002").unwrap();
    
    // 配置信息（使用默认值）
    let salt = "openpick";
    let master_key = "openpickopenpickopenpickopenpick";
    let nonce = "openpickopen";
    
    // 1. 创建测试用户
    let test_email = "testdata@openpick.org";
    let test_password = "testpassword";
    let test_user_name: &'static str = "Test Data User";
    let test_user_premium_balance = 1000;
    
    // 哈希密码
    let hashed_password = hash_password_with_user_id(test_password, test_user_id, salt);
    
    // 生成钱包
    let (private_key, wallet_address) = generate_wallet(master_key, nonce);
    
    let now = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    // 插入测试用户
    sqlx::query(
        r#"
        INSERT OR IGNORE INTO users (
            user_id, email, user_name, user_password, user_type, 
            private_key, wallet_address, premium_balance, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(test_user_id)
    .bind(test_email)
    .bind(test_user_name)
    .bind(hashed_password)
    .bind("dev") // 设置为开发者类型，可以创建picker
    .bind(private_key)
    .bind(&wallet_address)
    .bind(test_user_premium_balance) // premium_balance
    .bind(&now)
    .execute(pool)
    .await?;

    info!("Inserted test user: {} ({})", test_user_name, test_email);

    // 2. 创建测试Picker
    let test_picker_alias = "testpicker";
    let test_picker_description = "testpicker description";
    let test_picker_price = 1; // 示例价格
    
    // 插入测试Picker
    sqlx::query(
        r#"
        INSERT OR IGNORE INTO pickers (
            picker_id, dev_user_id, alias, description, price, 
            image_path, file_path, version, status, download_count, 
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(test_picker_id)
    .bind(test_user_id)
    .bind(test_picker_alias)
    .bind(test_picker_description)
    .bind(test_picker_price)
    .bind("test_image.jpg") // 示例图片路径
    .bind("test_picker.zip") // 示例文件路径
    .bind("1.0.0") // 版本号
    .bind("active") // 状态
    .bind(0) // download_count
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;

    info!("Inserted test picker: {} - {}", test_picker_alias, test_picker_description);

    // 3. 创建测试订单
    // 插入测试订单
    sqlx::query(
        r#"
        INSERT OR IGNORE INTO orders (
            order_id, status, user_id, picker_id, pay_type, 
            amount, tx_hash, created_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(test_order_id)
    .bind("pending") // 订单状态
    .bind(test_user_id)
    .bind(test_picker_id)
    .bind("wallet") // 支付方式
    .bind(test_picker_price) // 金额
    .bind(Option::<String>::None) // tx_hash (暂时为空)
    .bind(&now)
    .bind(Option::<String>::None) // expires_at (暂时为空)
    .execute(pool)
    .await?;

    info!("Inserted test order: {} (wallet payment, pending)", test_order_id);

    info!("Test data insertion completed successfully!");
    info!("Test user credentials - Email: {}, Password: {}", test_email, test_password);
    info!("Test user wallet address: {}", wallet_address);

    Ok(())
}

#[cfg(test)]
    mod tests {
        use crate::models::OrderStatus;
        use crate::utils::verify_password_with_user_id;
        use super::*;
        use serial_test::serial;
        use sqlx::Row;

        #[tokio::test]
        #[serial]
        async fn test_order_status_enum_mapping() {
            let pool = create_pool().await.expect("Failed to create pool");
            init_database(&pool).await.expect("Failed to init database");

            // 插入一个订单
            let order_id = uuid::Uuid::new_v4();
            let user_id = uuid::Uuid::new_v4();
            let picker_id = uuid::Uuid::new_v4();
            
            // 首先插入用户和picker
            sqlx::query(
                "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) VALUES (?, 'test@test.com', 'Test User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
            )
            .bind(user_id)
            .execute(&pool)
            .await
            .expect("Failed to insert user");

            sqlx::query(
                "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, download_count, created_at, updated_at) VALUES (?, ?, 'Test Picker', 'Test Description', 100, 'test.jpg', 'test.exe', '1.0', 'active', 0, datetime('now'), datetime('now'))"
            )
            .bind(picker_id)
            .bind(user_id)
            .execute(&pool)
            .await
            .expect("Failed to insert picker");

            // 插入订单
            sqlx::query(
                "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) VALUES (?, 'success', ?, ?, 'premium', 100, NULL, datetime('now'), NULL)"
            )
            .bind(order_id)
            .bind(user_id)
            .bind(picker_id)
            .execute(&pool)
            .await
            .expect("Failed to insert order");

            // 查询订单
            let order = sqlx::query_as::<_, crate::models::Order>(
                "SELECT * FROM orders WHERE order_id = ?"
            )
            .bind(order_id)
            .fetch_one(&pool)
            .await;
            
            assert!(order.is_ok(), "Failed to fetch order: {:?}", order.err());
            let order = order.unwrap();
            assert_eq!(order.status, OrderStatus::Success, "Expected status to be Success, but got {:?}", order.status);
        }

        #[tokio::test]
        #[serial]
        async fn test_simple_order_status_enum_mapping() {
            let pool = create_pool().await.expect("Failed to create pool");
            init_database(&pool).await.expect("Failed to init database");

            // 直接查询枚举值
            let result: Result<OrderStatus, _> = sqlx::query_scalar("SELECT 'success'")
                .fetch_one(&pool)
                .await;
            
            assert!(result.is_ok(), "Failed to fetch enum: {:?}", result.err());
            let status = result.unwrap();
            assert_eq!(status, OrderStatus::Success, "Expected status to be Success, but got {:?}", status);
        }

    #[tokio::test]
    #[serial]
    async fn test_order_status_enum_mapping_pending() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 插入一个订单
        let order_id = uuid::Uuid::new_v4();
        let user_id = uuid::Uuid::new_v4();
        let picker_id = uuid::Uuid::new_v4();
        
        // 首先插入用户和picker
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) VALUES (?, 'test@test.com', 'Test User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
        )
        .bind(user_id)
        .execute(&pool)
        .await
        .expect("Failed to insert user");

        sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, download_count, created_at, updated_at) VALUES (?, ?, 'Test Picker', 'Test Description', 100, 'test.jpg', 'test.exe', '1.0', 'active', 0, datetime('now'), datetime('now'))"
        )
        .bind(picker_id)
        .bind(user_id)
        .execute(&pool)
        .await
        .expect("Failed to insert picker");

        // 插入订单
        sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) VALUES (?, 'pending', ?, ?, 'premium', 100, NULL, datetime('now'), NULL)"
        )
        .bind(order_id)
        .bind(user_id)
        .bind(picker_id)
        .execute(&pool)
        .await
        .expect("Failed to insert order");

        // 查询订单
        let order = sqlx::query_as::<_, crate::models::Order>(
            "SELECT * FROM orders WHERE order_id = ?"
        )
        .bind(order_id)
        .fetch_one(&pool)
        .await;
        
        assert!(order.is_ok(), "Failed to fetch order: {:?}", order.err());
        let order = order.unwrap();
        assert_eq!(order.status, OrderStatus::Pending, "Expected status to be Pending, but got {:?}", order.status);
    }

    #[tokio::test]
    #[serial]
    async fn test_order_status_enum_mapping_expired() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 插入一个订单
        let order_id = uuid::Uuid::new_v4();
        let user_id = uuid::Uuid::new_v4();
        let picker_id = uuid::Uuid::new_v4();
        
        // 首先插入用户和picker
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) VALUES (?, 'test@test.com', 'Test User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
        )
        .bind(user_id)
        .execute(&pool)
        .await
        .expect("Failed to insert user");

        sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, download_count, created_at, updated_at) VALUES (?, ?, 'Test Picker', 'Test Description', 100, 'test.jpg', 'test.exe', '1.0', 'active', 0, datetime('now'), datetime('now'))"
        )
        .bind(picker_id)
        .bind(user_id)
        .execute(&pool)
        .await
        .expect("Failed to insert picker");

        // 插入订单
        sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) VALUES (?, 'expired', ?, ?, 'premium', 100, NULL, datetime('now'), NULL)"
        )
        .bind(order_id)
        .bind(user_id)
        .bind(picker_id)
        .execute(&pool)
        .await
        .expect("Failed to insert order");

        // 查询订单
        let order = sqlx::query_as::<_, crate::models::Order>(
            "SELECT * FROM orders WHERE order_id = ?"
        )
        .bind(order_id)
        .fetch_one(&pool)
        .await;
        
        assert!(order.is_ok(), "Failed to fetch order: {:?}", order.err());
        let order = order.unwrap();
        assert_eq!(order.status, OrderStatus::Expired, "Expected status to be Expired, but got {:?}", order.status);
    }

    #[tokio::test]
    #[serial]
    async fn test_create_pool() {
        let pool = create_pool().await;
        assert!(pool.is_ok(), "Failed to create database pool");
    }

    #[tokio::test]
    #[serial]
    async fn test_create_pool_success() {
        let pool = create_pool().await.expect("Failed to create pool");
        
        // 验证连接池可以执行查询
        let result = sqlx::query("SELECT 1 as test")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Pool connection should work");
    }

    #[tokio::test]
    #[serial]
    async fn test_init_database() {
        let pool = create_pool().await.expect("Failed to create pool");
        let result = init_database(&pool).await;
        assert!(result.is_ok(), "Failed to initialize database");
    }

    #[tokio::test]
    #[serial]
    async fn test_insert_test_data() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");
        
        // 手动插入测试数据
        insert_test_data(&pool).await.expect("Failed to insert test data");

        // 验证测试用户数据
        let user_row = sqlx::query("SELECT * FROM users WHERE email = ?")
            .bind("testdata@openpick.org")
            .fetch_one(&pool)
            .await
            .expect("Failed to fetch test user");
        
        let user_id: Vec<u8> = user_row.get("user_id");
        let user_id_uuid = Uuid::from_slice(&user_id).expect("Invalid user UUID");
        let email: String = user_row.get("email");
        let user_name: String = user_row.get("user_name");
        let user_password: String = user_row.get("user_password");
        let user_type: String = user_row.get("user_type");
        let wallet_address: String = user_row.get("wallet_address");
        let premium_balance: i64 = user_row.get("premium_balance");
        
        assert_eq!(email, "testdata@openpick.org");
        assert_eq!(user_name, "Test Data User");
        assert_eq!(user_type, "dev");
        assert_eq!(premium_balance, 0);
        assert!(wallet_address.starts_with("0x"));
        assert_eq!(wallet_address.len(), 42);
        
        // 验证密码哈希
        let salt = "openpick";
        let is_password_valid = verify_password_with_user_id("testpassword", user_id_uuid, &user_password, salt);
        assert!(is_password_valid, "Password verification failed");

        // 验证测试Picker数据
        let picker_row = sqlx::query("SELECT * FROM pickers WHERE alias = ?")
            .bind("testpicker")
            .fetch_one(&pool)
            .await
            .expect("Failed to fetch test picker");
        
        let picker_id: Vec<u8> = picker_row.get("picker_id");
        let picker_id_uuid = Uuid::from_slice(&picker_id).expect("Invalid picker UUID");
        let dev_user_id: Vec<u8> = picker_row.get("dev_user_id");
        let dev_user_id_uuid = Uuid::from_slice(&dev_user_id).expect("Invalid dev user UUID");
        let alias: String = picker_row.get("alias");
        let description: String = picker_row.get("description");
        let price: i64 = picker_row.get("price");
        let status: String = picker_row.get("status");
        let download_count: i64 = picker_row.get("download_count");
        
        assert_eq!(alias, "testpicker");
        assert_eq!(description, "testpicker description");
        assert_eq!(price, 100);
        assert_eq!(status, "active");
        assert_eq!(download_count, 0);
        assert_eq!(dev_user_id_uuid, user_id_uuid, "Picker should be owned by test user");

        // 验证测试订单数据
        let order_row = sqlx::query("SELECT * FROM orders WHERE user_id = ? AND picker_id = ?")
            .bind(&user_id)
            .bind(&picker_id)
            .fetch_one(&pool)
            .await
            .expect("Failed to fetch test order");
        
        let order_id: Vec<u8> = order_row.get("order_id");
        let order_id_uuid = Uuid::from_slice(&order_id).expect("Invalid order UUID");
        let order_status: String = order_row.get("status");
        let pay_type: String = order_row.get("pay_type");
        let amount: i64 = order_row.get("amount");
        let tx_hash: Option<String> = order_row.get("tx_hash");
        
        assert_eq!(order_status, "pending");
        assert_eq!(pay_type, "wallet");
        assert_eq!(amount, price, "Order amount should match picker price");
        assert!(tx_hash.is_none(), "tx_hash should be None for pending order");

        // 验证外键关系
        let order_user_id: Vec<u8> = order_row.get("user_id");
        let order_picker_id: Vec<u8> = order_row.get("picker_id");
        let order_user_id_uuid = Uuid::from_slice(&order_user_id).expect("Invalid order user UUID");
        let order_picker_id_uuid = Uuid::from_slice(&order_picker_id).expect("Invalid order picker UUID");
        
        assert_eq!(order_user_id_uuid, user_id_uuid, "Order should belong to test user");
        assert_eq!(order_picker_id_uuid, picker_id_uuid, "Order should reference test picker");

        println!("✅ 测试数据验证成功!");
        println!("📧 测试用户: {} ({})", user_name, email);
        println!("💰 钱包地址: {}", wallet_address);
        println!("📦 测试Picker: {} - {}", alias, description);
        println!("🛒 测试订单: {} ({} 支付, {} 状态)", order_id_uuid, pay_type, order_status);
    }

    #[tokio::test]
    #[serial]
    async fn test_init_database_idempotent() {
        let pool = create_pool().await.expect("Failed to create pool");
        
        // 第一次初始化
        let result1 = init_database(&pool).await;
        assert!(result1.is_ok(), "First initialization should succeed");
        
        // 第二次初始化（应该也成功，因为使用了 IF NOT EXISTS）
        let result2 = init_database(&pool).await;
        assert!(result2.is_ok(), "Second initialization should also succeed");
    }

    #[tokio::test]
    #[serial]
    async fn test_database_tables_created() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 测试用户表是否存在
        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Users table not created");

        // 测试Picker表是否存在
        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='pickers'")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Pickers table not created");

        // 测试订单表是否存在
        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Orders table not created");
    }

    #[tokio::test]
    #[serial]
    async fn test_database_indexes_created() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 测试用户邮箱索引
        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_users_email'")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Users email index not created");

        // 测试Picker状态索引
        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_pickers_status'")
            .fetch_optional(&pool)
            .await;
        assert!(result.is_ok(), "Pickers status index not created");

        // 测试订单用户ID索引
        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_orders_user_id'")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Orders user_id index not created");
    }

    #[tokio::test]
    #[serial]
    async fn test_user_table_constraints() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 测试用户类型约束
        let result = sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('test1', 'test@example.com', 'Test User', 'invalid_type', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await;
        
        assert!(result.is_err(), "Should fail with invalid user_type");
    }

    #[tokio::test]
    #[serial]
    async fn test_user_table_valid_constraints() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 测试有效的用户类型
        let result_gen = sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('test1', 'test1@example.com', 'Test User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await;
        assert!(result_gen.is_ok(), "Should succeed with valid user_type 'gen'");

        let result_dev = sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('test2', 'test2@example.com', 'Test Dev', 'hashed_password', 'dev', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await;
        assert!(result_dev.is_ok(), "Should succeed with valid user_type 'dev'");
    }

    #[tokio::test]
    #[serial]
    async fn test_user_email_unique_constraint() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 插入第一个用户
        let result1 = sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('test1', 'duplicate@example.com', 'Test User 1', 'hashed_password', 'gen', 'key1', 'addr1', datetime('now'))"
        )
        .execute(&pool)
        .await;
        assert!(result1.is_ok(), "First user insertion should succeed");

        // 尝试插入相同邮箱的用户
        let result2 = sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('test2', 'duplicate@example.com', 'Test User 2', 'hashed_password', 'dev', 'key2', 'addr2', datetime('now'))"
        )
        .execute(&pool)
        .await;
        assert!(result2.is_err(), "Should fail with duplicate email");
    }

    #[tokio::test]
    #[serial]
    async fn test_picker_table_constraints() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 先插入一个用户
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('dev1', 'dev@example.com', 'Dev User', 'hashed_password', 'dev', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test user");

        // 测试状态约束
        let result = sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, created_at, updated_at) VALUES ('picker1', 'dev1', 'Test Picker', 'Description', 100, 'img.png', 'file.zip', '1.0', 'invalid_status', datetime('now'), datetime('now'))"
        )
        .execute(&pool)
        .await;
        
        assert!(result.is_err(), "Should fail with invalid status");
    }

    #[tokio::test]
    #[serial]
    async fn test_picker_table_valid_constraints() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 先插入一个用户
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('dev1', 'dev@example.com', 'Dev User', 'hashed_password', 'dev', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test user");

        // 测试有效的状态
        let result_active = sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, created_at, updated_at) VALUES ('picker1', 'dev1', 'Test Picker 1', 'Description', 100, 'img.png', 'file.zip', '1.0', 'active', datetime('now'), datetime('now'))"
        )
        .execute(&pool)
        .await;
        assert!(result_active.is_ok(), "Should succeed with valid status 'active'");

        let result_inactive = sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, created_at, updated_at) VALUES ('picker2', 'dev1', 'Test Picker 2', 'Description', 100, 'img.png', 'file.zip', '1.0', 'inactive', datetime('now'), datetime('now'))"
        )
        .execute(&pool)
        .await;
        assert!(result_inactive.is_ok(), "Should succeed with valid status 'inactive'");
    }

    #[tokio::test]
    #[serial]
    async fn test_picker_foreign_key_constraint() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 尝试插入引用不存在用户的Picker
        let result = sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, created_at, updated_at) VALUES ('picker1', 'nonexistent_user', 'Test Picker', 'Description', 100, 'img.png', 'file.zip', '1.0', 'active', datetime('now'), datetime('now'))"
        )
        .execute(&pool)
        .await;
        
        // With foreign key constraints enabled, this should fail
        assert!(result.is_err(), "Should fail with foreign key constraint violation");
    }
    
    #[tokio::test]
    #[serial]
    async fn test_order_foreign_key_constraints() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 插入测试用户
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('user1', 'user@example.com', 'User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test user");

        // 尝试插入引用不存在picker的订单
        let result = sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) 
             VALUES ('order1', 'pending', 'user1', 'nonexistent_picker', 'wallet', 100, NULL, datetime('now'), NULL)"
        )
        .execute(&pool)
        .await;
        
        // With foreign key constraints enabled, this should fail
        assert!(result.is_err(), "Should fail with foreign key constraint violation for picker_id");
        
        // 尝试插入引用不存在用户的订单
        let result = sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) 
             VALUES ('order2', 'pending', 'nonexistent_user', 'nonexistent_picker', 'wallet', 100, NULL, datetime('now'), NULL)"
        )
        .execute(&pool)
        .await;
        
        // With foreign key constraints enabled, this should fail
        assert!(result.is_err(), "Should fail with foreign key constraint violation for user_id");
    }

    #[tokio::test]
    #[serial]
    async fn test_order_table_constraints() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 先插入测试数据
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('user1', 'user@example.com', 'User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test user");

        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('dev1', 'dev@example.com', 'Dev', 'hashed_password', 'dev', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test dev");

        sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, created_at, updated_at) 
             VALUES ('picker1', 'dev1', 'Test Picker', 'Description', 100, 'img.png', 'file.zip', '1.0', 'active', datetime('now'), datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test picker");

        // 测试订单状态约束
        let result = sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) 
             VALUES ('order1', 'invalid_status', 'user1', 'picker1', 'premium', 100, NULL, datetime('now'), NULL)"
        )
        .execute(&pool)
        .await;
        
        assert!(result.is_err(), "Should fail with invalid order status");

        // 测试支付类型约束
        let result = sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) 
             VALUES ('order2', 'Pending', 'user1', 'picker1', 'invalid_pay_type', 100, NULL, datetime('now'), NULL)"
        )
        .execute(&pool)
        .await;
        
        assert!(result.is_err(), "Should fail with invalid pay_type");
    }

    #[tokio::test]
    #[serial]
    async fn test_order_table_valid_constraints() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 先插入测试数据
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('user1', 'user@example.com', 'User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test user");

        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('dev1', 'dev@example.com', 'Dev', 'hashed_password', 'dev', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test dev");

        sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, created_at, updated_at) 
             VALUES ('picker1', 'dev1', 'Test Picker', 'Description', 100, 'img.png', 'file.zip', '1.0', 'active', datetime('now'), datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test picker");

        // 测试有效的订单状态
        let result_pending = sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) 
             VALUES ('order1', 'pending', 'user1', 'picker1', 'wallet', 100, NULL, datetime('now'), NULL)"
        )
        .execute(&pool)
        .await;
        assert!(result_pending.is_ok(), "Should succeed with valid status 'pending'");

        let result_success = sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) 
             VALUES ('order2', 'success', 'user1', 'picker1', 'premium', 100, NULL, datetime('now'), NULL)"
        )
        .execute(&pool)
        .await;
        assert!(result_success.is_ok(), "Should succeed with valid status 'success'");

        let result_expired = sqlx::query(
            "INSERT INTO orders (order_id, status, user_id, picker_id, pay_type, amount, tx_hash, created_at, expires_at) 
             VALUES ('order3', 'expired', 'user1', 'picker1', 'wallet', 100, NULL, datetime('now'), NULL)"
        )
        .execute(&pool)
        .await;
        assert!(result_expired.is_ok(), "Should succeed with valid status 'expired'");
    }

    #[tokio::test]
    #[serial]
    async fn test_database_connection_pool_properties() {
        let pool = create_pool().await.expect("Failed to create pool");
        
        // 测试连接池是否可以处理多个并发查询
        let mut handles = vec![];
        
        for i in 0..5 {
            let pool_clone = pool.clone();
            let handle = tokio::spawn(async move {
                sqlx::query(&format!("SELECT {} as test_value", i))
                    .fetch_one(&pool_clone)
                    .await
            });
            handles.push(handle);
        }
        
        // 等待所有查询完成
        for handle in handles {
            let result = handle.await.expect("Task should complete");
            assert!(result.is_ok(), "Concurrent query should succeed");
        }
    }

    #[tokio::test]
    #[serial]
    async fn test_database_schema_validation() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 验证用户表结构
        let result = sqlx::query("PRAGMA table_info(users)")
            .fetch_all(&pool)
            .await;
        assert!(result.is_ok(), "Should be able to get users table info");
        let columns = result.unwrap();
        assert!(columns.len() >= 7, "Users table should have at least 7 columns");

        // 验证Picker表结构
        let result = sqlx::query("PRAGMA table_info(pickers)")
            .fetch_all(&pool)
            .await;
        assert!(result.is_ok(), "Should be able to get pickers table info");
        let columns = result.unwrap();
        assert!(columns.len() >= 10, "Pickers table should have at least 10 columns");

        // 验证订单表结构
        let result = sqlx::query("PRAGMA table_info(orders)")
            .fetch_all(&pool)
            .await;
        assert!(result.is_ok(), "Should be able to get orders table info");
        let columns = result.unwrap();
        assert!(columns.len() >= 8, "Orders table should have at least 8 columns");
    }

    #[tokio::test]
    #[serial]
    async fn test_database_default_values() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");

        // 测试用户表的默认值
        sqlx::query(
            "INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, created_at) 
             VALUES ('test1', 'test@example.com', 'Test User', 'hashed_password', 'gen', 'key', 'addr', datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert user");

        let row = sqlx::query("SELECT premium_balance FROM users WHERE user_id = 'test1'")
            .fetch_one(&pool)
            .await
            .expect("Failed to fetch user");
        
        let premium_balance: i64 = row.get("premium_balance");
        assert_eq!(premium_balance, 0, "Default premium_balance should be 0");

        // 测试Picker表的默认值
        sqlx::query(
            "INSERT INTO pickers (picker_id, dev_user_id, alias, description, price, image_path, file_path, version, status, created_at, updated_at) 
             VALUES ('picker1', 'test1', 'Test Picker', 'Description', 100, 'img.png', 'file.zip', '1.0', 'active', datetime('now'), datetime('now'))"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert picker");

        let row = sqlx::query("SELECT download_count FROM pickers WHERE picker_id = 'picker1'")
            .fetch_one(&pool)
            .await
            .expect("Failed to fetch picker");
        
        let download_count: i64 = row.get("download_count");
        assert_eq!(download_count, 0, "Default download_count should be 0");
    }
    
    #[tokio::test]
    #[serial]
    async fn test_simple_order_status_enum_mapping_expired() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");
    
        // 直接查询枚举值
        let result: Result<OrderStatus, _> = sqlx::query_scalar("SELECT 'expired'")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Failed to fetch enum: {:?}", result.err());
        let status = result.unwrap();
        assert_eq!(status, OrderStatus::Expired, "Expected status to be Expired, but got {:?}", status);
    }

    #[tokio::test]
    #[serial]
    async fn test_simple_order_status_enum_mapping_pending() {
        let pool = create_pool().await.expect("Failed to create pool");
        init_database(&pool).await.expect("Failed to init database");
    
        // 直接查询枚举值
        let result: Result<OrderStatus, _> = sqlx::query_scalar("SELECT 'pending'")
            .fetch_one(&pool)
            .await;
        
        assert!(result.is_ok(), "Failed to fetch enum: {:?}", result.err());
        let status = result.unwrap();
        assert_eq!(status, OrderStatus::Pending, "Expected status to be Pending, but got {:?}", status);
    }
}
USE [master]
GO
/****** Object:  Database [addon]    Script Date: 18/11/2021 10:49:44 a. m. ******/
CREATE DATABASE [addon]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'addon', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\addon.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'addon_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\addon_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [addon] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [addon].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [addon] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [addon] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [addon] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [addon] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [addon] SET ARITHABORT OFF 
GO
ALTER DATABASE [addon] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [addon] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [addon] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [addon] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [addon] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [addon] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [addon] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [addon] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [addon] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [addon] SET  DISABLE_BROKER 
GO
ALTER DATABASE [addon] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [addon] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [addon] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [addon] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [addon] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [addon] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [addon] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [addon] SET RECOVERY FULL 
GO
ALTER DATABASE [addon] SET  MULTI_USER 
GO
ALTER DATABASE [addon] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [addon] SET DB_CHAINING OFF 
GO
ALTER DATABASE [addon] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [addon] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [addon] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [addon] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'addon', N'ON'
GO
ALTER DATABASE [addon] SET QUERY_STORE = OFF
GO
USE [addon]
GO
/****** Object:  User [addon]    Script Date: 18/11/2021 10:49:45 a. m. ******/
CREATE USER [addon] FOR LOGIN [addon] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [addon]
GO
ALTER ROLE [db_datareader] ADD MEMBER [addon]
GO
/****** Object:  Table [dbo].[GmailAccounts]    Script Date: 18/11/2021 10:49:45 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GmailAccounts](
	[accounId] [int] IDENTITY(1,1) NOT NULL,
	[usuarioGoogle] [varchar](255) NOT NULL,
	[token] [varchar](255) NULL,
	[urlAbox] [varchar](255) NULL,
	[urlSoap] [varchar](255) NULL,
	[usuario] [varchar](255) NULL,
	[documentTypeCode] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[accounId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
USE [master]
GO
ALTER DATABASE [addon] SET  READ_WRITE 
GO

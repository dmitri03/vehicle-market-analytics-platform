using Marketplace.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Api.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<Make> Makes => Set<Make>();
    public DbSet<Model> Models => Set<Model>();
    public DbSet<Location> Locations => Set<Location>();

    public DbSet<VehicleListing> VehicleListings => Set<VehicleListing>();
    public DbSet<PartListing> PartListings => Set<PartListing>();
    public DbSet<InventoryDaily> InventoryDaily => Set<InventoryDaily>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Users
        modelBuilder.Entity<User>().ToTable("users").HasKey(x => x.UserId);
        modelBuilder.Entity<User>().Property(x => x.UserId).HasColumnName("user_id");
        modelBuilder.Entity<User>().Property(x => x.Email).HasColumnName("email");
        modelBuilder.Entity<User>().Property(x => x.PasswordHash).HasColumnName("password_hash");
        modelBuilder.Entity<User>().Property(x => x.IsActive).HasColumnName("is_active");

        modelBuilder.Entity<Role>().ToTable("roles").HasKey(x => x.RoleId);
        modelBuilder.Entity<Role>().Property(x => x.RoleId).HasColumnName("role_id");
        modelBuilder.Entity<Role>().Property(x => x.RoleName).HasColumnName("role_name");

        modelBuilder.Entity<UserRole>().ToTable("user_roles").HasKey(x => new { x.UserId, x.RoleId });
        modelBuilder.Entity<UserRole>().Property(x => x.UserId).HasColumnName("user_id");
        modelBuilder.Entity<UserRole>().Property(x => x.RoleId).HasColumnName("role_id");

        // Reference tables
        modelBuilder.Entity<Make>().ToTable("makes").HasKey(x => x.MakeId);
        modelBuilder.Entity<Model>().ToTable("models").HasKey(x => x.ModelId);
        modelBuilder.Entity<Location>().ToTable("locations").HasKey(x => x.LocationId);

        // Fact tables
        modelBuilder.Entity<VehicleListing>().ToTable("vehicle_listings").HasKey(x => x.VehicleListingId);
        modelBuilder.Entity<PartListing>().ToTable("part_listings").HasKey(x => x.PartListingId);
        modelBuilder.Entity<InventoryDaily>().ToTable("inventory_daily").HasKey(x => new { x.SnapshotDate, x.ModelId, x.State, x.ListingType });

        // Column mappings (key/common fields).
        modelBuilder.Entity<VehicleListing>().Property(x => x.VehicleListingId).HasColumnName("vehicle_listing_id");
        modelBuilder.Entity<VehicleListing>().Property(x => x.ListingHash).HasColumnName("listing_hash");
        modelBuilder.Entity<VehicleListing>().Property(x => x.Url).HasColumnName("url");
        modelBuilder.Entity<VehicleListing>().Property(x => x.MakeId).HasColumnName("make_id");
        modelBuilder.Entity<VehicleListing>().Property(x => x.ModelId).HasColumnName("model_id");
        modelBuilder.Entity<VehicleListing>().Property(x => x.Year).HasColumnName("year");
        modelBuilder.Entity<VehicleListing>().Property(x => x.ModelConfig).HasColumnName("model_config");
        modelBuilder.Entity<VehicleListing>().Property(x => x.Price).HasColumnName("price");
        modelBuilder.Entity<VehicleListing>().Property(x => x.MileageText).HasColumnName("mileage_text");
        modelBuilder.Entity<VehicleListing>().Property(x => x.LocationId).HasColumnName("location_id");
        modelBuilder.Entity<VehicleListing>().Property(x => x.IsDealership).HasColumnName("is_dealership");
        modelBuilder.Entity<VehicleListing>().Property(x => x.ScrapedAt).HasColumnName("scraped_at");
        modelBuilder.Entity<VehicleListing>().Property(x => x.SnapshotDate).HasColumnName("snapshot_date");
        modelBuilder.Entity<VehicleListing>().Property(x => x.RawTitle).HasColumnName("raw_title");

        modelBuilder.Entity<PartListing>().Property(x => x.PartListingId).HasColumnName("part_listing_id");
        modelBuilder.Entity<PartListing>().Property(x => x.ListingHash).HasColumnName("listing_hash");
        modelBuilder.Entity<PartListing>().Property(x => x.Url).HasColumnName("url");
        modelBuilder.Entity<PartListing>().Property(x => x.MakeId).HasColumnName("make_id");
        modelBuilder.Entity<PartListing>().Property(x => x.ModelId).HasColumnName("model_id");
        modelBuilder.Entity<PartListing>().Property(x => x.Year).HasColumnName("year");
        modelBuilder.Entity<PartListing>().Property(x => x.Title).HasColumnName("title");
        modelBuilder.Entity<PartListing>().Property(x => x.Description).HasColumnName("description");
        modelBuilder.Entity<PartListing>().Property(x => x.Price).HasColumnName("price");
        modelBuilder.Entity<PartListing>().Property(x => x.LocationId).HasColumnName("location_id");
        modelBuilder.Entity<PartListing>().Property(x => x.IsDealership).HasColumnName("is_dealership");
        modelBuilder.Entity<PartListing>().Property(x => x.ScrapedAt).HasColumnName("scraped_at");
        modelBuilder.Entity<PartListing>().Property(x => x.SnapshotDate).HasColumnName("snapshot_date");

        modelBuilder.Entity<InventoryDaily>().Property(x => x.SnapshotDate).HasColumnName("snapshot_date");
        modelBuilder.Entity<InventoryDaily>().Property(x => x.MakeId).HasColumnName("make_id");
        modelBuilder.Entity<InventoryDaily>().Property(x => x.ModelId).HasColumnName("model_id");
        modelBuilder.Entity<InventoryDaily>().Property(x => x.State).HasColumnName("state");
        modelBuilder.Entity<InventoryDaily>().Property(x => x.ListingType).HasColumnName("listing_type");
        modelBuilder.Entity<InventoryDaily>().Property(x => x.ListingCount).HasColumnName("listing_count");
    }
}

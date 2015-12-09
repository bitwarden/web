using System;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace Bit.Vault
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services) { }

        public void Configure(IApplicationBuilder app)
        {
            app.UseIISPlatformHandler();
            app.UseFileServer();
        }

        // Entry point for the application.
        public static void Main(string[] args) => WebApplication.Run<Startup>(args);
    }
}

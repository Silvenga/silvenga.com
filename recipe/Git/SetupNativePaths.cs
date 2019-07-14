using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using LibGit2Sharp;

namespace Wyam.SlightBlog.Git
{
    public class SetupNativePaths
    {
        public static string NativePlatform
        {
            get
            {
                var os = "any";
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    os = "win";
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    os = "os";
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    os = "win";
                }

                var arch = RuntimeInformation.OSArchitecture.ToString().ToLower();

                var platform = os + "-" + arch;
                return platform;
            }
        }

        public static void SetupGit()
        {
            var nativeDirectory = Path.Combine(GetExecutingAssemblyDirectory(), "runtimes", NativePlatform, "native");

            GlobalSettings.NativeLibraryPath = nativeDirectory;
        }

        private static string GetExecutingAssemblyDirectory()
        {
            string path = Assembly.GetExecutingAssembly().CodeBase;
            if (path.StartsWith("file:///"))
                path = path.Substring(8).Replace('/', '\\');
            else if (path.StartsWith("file://"))
                path = "\\\\" + path.Substring(7).Replace('/', '\\');
            return Path.GetDirectoryName(path);
        }
    }
}
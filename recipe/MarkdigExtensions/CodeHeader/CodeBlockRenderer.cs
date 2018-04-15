using System;
using System.Collections.Generic;
using Markdig.Parsers;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Syntax;

namespace MarkdigExtensions.CodeHeader
{
    public class CodeHeaderRenderer : HtmlObjectRenderer<CodeBlock>
    {
        public readonly Dictionary<string, string> CodeLanguageMap = new Dictionary<string, string>
        {
            { "ps1", "PowerShell" },
            { "ps", "PowerShell" },
            { "powershell", "PowerShell" },
            { "cmd", "Windows Command Line" },
            { "bat", "Windows Command Line" },
            { "bash", "Bash" },
            { "js", "JavaScript" },
            { "ts", "TypeScript" },
            { "log", "Logs" },
            { "logs", "Logs" },
            { "json", "JSON" },
            { "gpg", "GPG Key" },
            { "term", "Terminal" },
            { "dockerfile", "Dockerfile" },
        };

        protected override void Write(HtmlRenderer renderer, CodeBlock obj)
        {
            renderer.EnsureLine();

            if (renderer.EnableHtmlForBlock)
            {

                // <div class=\"code-header\">
                //     <span class=\"language\">PowerShell</span>
                //     <button class=\"copy\">
                //         <span>Copy</span>
                //     </button>
                // </div>

                var language = "Code";
                var info = (obj as FencedCodeBlock)?.Info;
                if (info != null && CodeLanguageMap.ContainsKey(info))
                {
                    language = CodeLanguageMap[info];
                }
                else if (info != null && info.StartsWith("file-"))
                {
                    var file = info.Substring("file-".Length);
                    language = file;
                }

                var copyId = Guid.NewGuid().ToString("N");

                renderer.Write("<div class=\"code-header\">");
                renderer.Write($"   <span class=\"language\">{language}</span>");
                renderer.Write($"   <button class=\"copy\" data-copy-id=\"{copyId}\">");
                renderer.Write("        <span>Copy</span>");
                renderer.Write("    </button>");
                renderer.Write("</div>");

                renderer.Write("<pre");

                renderer.Write($"><code data-copy-target=\"{copyId}\"");

                renderer.WriteAttributes(obj);

                renderer.Write(">");
            }

            renderer.WriteLeafRawLines(obj, true, true);

            if (renderer.EnableHtmlForBlock)
            {
                renderer.WriteLine("</code></pre>");
            }
        }
    }
}
using System;
using System.Collections.Generic;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Syntax;

namespace Wyam.SlightBlog.MarkdigExtensions.CodeHeader
{
    public class CodeHeaderRenderer : HtmlObjectRenderer<CodeBlock>
    {
        private readonly Dictionary<string, (string Human, string Class)> _codeLanguageMap = new Dictionary<string, (string Human, string Class)>
        {
            {"ps1", ("PowerShell", "powershell")},
            {"ps", ("PowerShell", "powershell")},
            {"powershell", ("PowerShell", "powershell")},
            {"cmd", ("Windows Command Line", "cmd")},
            {"bat", ("Windows Command Line", "cmd")},
            {"bash", ("Bash", "bash")},
            {"js", ("JavaScript", "js")},
            {"ts", ("TypeScript", "ts")},
            {"log", ("Logs", "logs")},
            {"logs", ("Logs", "logs")},
            {"json", ("JSON", "json")},
            {"gpg", ("GPG Key", "gpg")},
            {"term", ("Terminal", "cli")},
            {"cli", ("Terminal", "cli")},
            {"dockerfile", ("Dockerfile", "dockerfile")},
            {"output", ("Output", "output")},
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

                var languageHuman = "Code";
                var languageClass = "code";
                var info = (obj as FencedCodeBlock)?.Info;
                if (info != null && _codeLanguageMap.ContainsKey(info))
                {
                    languageHuman = _codeLanguageMap[info].Human;
                    languageClass = _codeLanguageMap[info].Class;
                }
                else if (info != null && info.StartsWith("file-"))
                {
                    var file = info.Substring("file-".Length);
                    languageHuman = file;
                    languageClass = "file";
                }

                var copyId = Guid.NewGuid().ToString("N");

                renderer.Write($"<div class=\"code-header lang-{languageClass}\">");
                renderer.Write($"   <span class=\"language\">{languageHuman}</span>");
                renderer.Write($"   <button class=\"copy\" data-copy-id=\"{copyId}\">");
                renderer.Write("        <i class=\"copy-icon\"></i>");
                renderer.Write("        <span>Copy</span>");
                renderer.Write("    </button>");
                renderer.Write("</div>");

                renderer.Write($"<pre class=\"lang-{languageClass} copy-pending\"");

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
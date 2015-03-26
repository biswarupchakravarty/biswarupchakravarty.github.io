module Jekyll
  class CombinedOutputGenerator < Converter
    safe true

    def matches(ext)
      ext =~ /^\.js_manifest$/i
    end

    def output_ext(ext)
      ".js"
    end

    def convert(content)
      content.upcase
      Dir.chdir("#{Dir.pwd}/_plugins/") do
        puts `php combine.php`
      end
    end
  end
end
var request = require('request')
var fs = require('fs')
var he = require('he')

var p5playDataURL = 'http://p5play.molleindustria.org/docs/data.json',
    outputPath = '/../snippets/p5play-snippets.json',
    p5playDocsURL = 'http://p5play.molleindustria.org/docs/classes/'

var snippet = {} //to build the snippets from the source json file

request(p5playDataURL, function (error, response, body)
{
  if (!error && response.statusCode == 200)
  {
    console.log('deleting old file...')
    fs.writeFileSync(__dirname + outputPath,'')
    console.log('Writing new file...')

    var obj = JSON.parse(body)

    obj.classitems.forEach(function(element)
    {
      if (element.itemtype == 'property' || element.itemtype == 'method' )
      {
        var name = element.name,
            concatedName,
            descriptionMoreURL = p5playDocsURL,
            params = []
        if (element.params)
        {
          element.params.forEach(function(p)
          {
              handleParams(p)
          })
        }

        if (element.overloads)
        {
          element.overloads[0].params.forEach(function(p)
          {
            handleParams(p)
          })
        }

        function handleParams(p)
        {
          if (p.optional)
          {
            params.push("[" + p.name + "]")
          }
          else
          {
            params.push(p.name)
          }
        }

        if (element.itemtype == 'method')
        {
          concatedName = name + '(' + params + ')'
        }
        else
        {
          concatedName = name
        }

        //set the name
        snippet[concatedName] =
        {
            'rightLabelHTML': '<span style="color:#ed225d;display:inline-block;font-weight:400;font-size:1.25em">p5play</span>',
            'leftLabel': null,
            'prefix': null,
            'body': null,
            'description': null,
            'descriptionMoreURL': null
        }
        //set the prefix & body
        if (element.itemtype == 'method')
        {
          snippet[concatedName].prefix = name + '(' + params + ')'
          snippet[concatedName].leftLabel = name + '()'
          snippet[concatedName].body = name + '('

          //tab moving part of the snippet for each param
          for (var i = 0; i < params.length; i++)
          {
            if (params.length <= 1 || i == params.length-1)
            {
              snippet[concatedName].body += '${' +(i+1)+ ':' + params[i] +'}'
            }
            else
            { //use a comma
              snippet[concatedName].body += '${' +(i+1)+ ':' + params[i] +'},'
            }
          }
          snippet[concatedName].body += ')$'+ (i+1)
        }
        else
        {
          snippet[concatedName].prefix = name
          snippet[concatedName].leftLabel = name
          snippet[concatedName].body = name
        }

        // set the description
        if (element.description)
        {
          //regex out html tags:
          var cleanDes
          cleanDes = element.description
          // console.log(element.description.toString())
          cleanDes = cleanDes.replace(/(<p>)|(<\/p>)|(<br>)/g,"") //remove p and br tags
          cleanDes = cleanDes.replace(/\r?\n|\r/g," ") //remove newlines
          // cleanDes  = cleanDes.replace(/(&lt;)/g,"<") //ascii to less than
          // cleanDes  = cleanDes.replace(/(&gt;)/g,">") //ascii to greater than
          cleanDes = he.decode(cleanDes) //use he to decode all html codes into characters
          if (cleanDes.length > 230 )
          {
            // cleanDes = cleanDes.substring(0, chopLength )
            cleanDes = cleanDes.replace(/^(.{230}[^\s]*).*/, "$1")
            snippet[concatedName].description = cleanDes + ' ...'
          }
          else
          {
            snippet[concatedName].description = cleanDes
          }
        }
        else
        {
          snippet[concatedName].description = ""
        }

        // set the docs URL
        descriptionMoreURL += element.class + '.html'
        if (element.itemtype == 'method') descriptionMoreURL += '#method-'
        else descriptionMoreURL += '#prop-'
        descriptionMoreURL += name
        snippet[concatedName].descriptionMoreURL = descriptionMoreURL
        console.log(descriptionMoreURL)
      } // end typeCheck
    }) //end forEach

    var out = {".source.js": null} //add the js header the to top and wrap the whole thing in an object
    out[".source.js"] = snippet
    fs.writeFileSync(__dirname + outputPath, JSON.stringify(out))
    console.log('Finished Writing File...')
  }
  else
  {
    console.error('could not reach the file at p5playDataURL')
  }
}) //close request

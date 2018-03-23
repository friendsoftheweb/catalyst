# Catalyst &middot; [![Build Status](https://travis-ci.org/friendsoftheweb/catalyst.svg?branch=master)](https://travis-ci.org/friendsoftheweb/catalyst)

Catalyst is an opinionated tool for creating and maintaining React/Redux applications. It sets up Webpack, Flow, ESLint, React, Redux, Redux Saga, SASS, Autoprefixer, and more!

## Starting a New Project

```
$ yarn add catalyst
$ yarn run catalyst init
```

## Basic Project Structure

<pre>
├─ bundles
|  └─ application
|     ├─ <b>index.js</b>
|     ├─ <b>reducer.js</b>
|     ├─ <b>saga.js</b>
|     ├─ <b>store-provider.js</b>
|     └─ <b>styles.scss</b>
|
├─ components
|  ├─ __tests__
|  └─ component-name
|     ├─ <b>index.js</b>
|     ├─ styles.scss
|     └─ sub-component-name
|        ├─ <b>index.js</b>
|        └─ styles.scss
|
├─ modules
|  └─ module-name
|     ├─ __tests__
|     ├─ <b>index.js</b>
|     ├─ <b>reducer.js</b>
|     ├─ <b>action-creators.js</b>
|     ├─ saga.js
|     ├─ requests.js
|     └─ getters.js
|
├─ utils
|  └─ request.js
|
├─ config
|  └─ webpack.js
|
└─ styles
   └─ index.scss
</pre>

## Starting the Development Server

You can start the Webpack server with:

```
$ yarn start
```

By default, the server will be accessible at http://localhost:8080. You can override this by setting
`DEV_SERVER_HOST` and/or `DEV_SERVER_PORT` environment variables.

If you want to be able to access your development server from other devices on your local network,
you can start it like this:

```
$ DEV_SERVER_HOST=`ipconfig getifaddr en0` yarn start
```

Where `en0` is the network device you're using.

## Integrating with Rails

Add the follow helper to your project as `/app/helpers/assets_helper.rb`:

```ruby
module AssetsHelper
  class WebpackManifest
    MANIFEST_PATH = Rails.root.join('public/assets/manifest.json')
    ASSETS_BASE_PATH = '/assets'
    DEV_SERVER_PORT = 8080

    AssetMissing = Class.new(StandardError)

    include Singleton

    class << self
      delegate :[], to: :instance
    end

    def initialize
      if Rails.env.development?
        @manifest = {}
      else
        @manifest = JSON.parse(File.read(MANIFEST_PATH))
      end
    end

    def [](path)
      path = path.to_s.gsub(/\A\/+/, '')

      # In development we attempt to use a local IP to access the assets on the Webpack dev server
      # so the site can be viewed on mobile devices.
      if Rails.env.development?
        ["http://localhost:#{DEV_SERVER_PORT}", path].join('/')
      else
        if @manifest.key?(path)
          [ASSETS_BASE_PATH, @manifest[path]].join('/')
        else
          raise AssetMissing, "Couldn't find an asset for path: #{path}"
        end
      end
    end
  end

  def webpack_javascript_vendor_include_tag
    if Rails.env.development?
      content_tag(:script, nil, src: WebpackManifest['vendor-dll.js'])
    end
  end

  def webpack_javascript_include_tag(path)
    path = path.to_s.gsub(/\.js\z/, '')

    content_tag(
      :script,
      nil,
      src: WebpackManifest["#{path}.js"],
      type: 'text/javascript'
    )
  end

  def webpack_stylesheet_link_tag(path)
    path = path.to_s.gsub(/\.css\z/, '')

    unless Rails.env.development?
      content_tag(
        :link,
        nil,
        href: WebpackManifest["#{path}.css"],
        media: 'screen',
        rel: 'stylesheet'
      )
    end
  end

  def webpack_asset_path(path)
    WebpackManifest[path]
  end

  def webpack_asset_url(path)
    if Rails.env.development? || ENV['HOST'].blank?
      webpack_asset_path(path)
    else
      "https://#{ENV['HOST']}#{webpack_asset_path(path)}"
    end
  end
end
```

And then add the necessary script/link tag to your Rails layout:

```erb
<%= webpack_stylesheet_link_tag(:application) %>

<%= webpack_javascript_vendor_include_tag %>
<%= webpack_javascript_include_tag(:application) %>
```

The `webpack_javascript_vendor_include_tag` method only adds a script tag in
development mode to load prebuilt vendor packages. It _must_ be added before
any tags added via `webpack_javascript_include_tag`.

If you have common chunks enabled, you'll need to load the common JavaScript
file as well:

```erb
<%= webpack_stylesheet_link_tag(:application) %>

<%= webpack_javascript_vendor_include_tag %>
<%= webpack_javascript_include_tag(:common) %>
<%= webpack_javascript_include_tag(:application) %>
```

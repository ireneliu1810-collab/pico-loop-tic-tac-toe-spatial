package com.luluanan.looptictactoe.spatial.content

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.AssetManager
import android.graphics.Color
import android.net.Uri
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import java.io.IOException

private const val TAG = "LoopTicTacToeWeb"
private const val APP_ASSET_HOST = "appassets.androidplatform.net"
private const val APP_ASSET_ROOT = "/assets/web/"
private const val APP_START_URL = "https://$APP_ASSET_HOST${APP_ASSET_ROOT}index.html"

private class BundledAssetWebViewClient(context: Context) : WebViewClient() {
    private val assets = context.applicationContext.assets

    override fun shouldOverrideUrlLoading(
        view: WebView?,
        request: WebResourceRequest?
    ): Boolean {
        val uri = request?.url ?: return true
        return uri.scheme != "https" || uri.host != APP_ASSET_HOST
    }

    override fun shouldInterceptRequest(
        view: WebView?,
        request: WebResourceRequest?
    ): WebResourceResponse? {
        val uri = request?.url ?: return null
        val assetPath = uri.toBundledAssetPath() ?: return null

        return try {
            WebResourceResponse(
                mimeType(assetPath),
                if (isTextAsset(assetPath)) "UTF-8" else null,
                assets.open(assetPath, AssetManager.ACCESS_STREAMING)
            ).apply {
                responseHeaders = mapOf(
                    "Cache-Control" to "no-store",
                    "Access-Control-Allow-Origin" to "https://$APP_ASSET_HOST",
                    "X-Content-Type-Options" to "nosniff"
                )
            }
        } catch (error: IOException) {
            Log.e(TAG, "Missing bundled web asset: $assetPath", error)
            null
        }
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        Log.i(TAG, "Bundled game loaded: $url")
    }

    private fun Uri.toBundledAssetPath(): String? {
        if (scheme != "https" || host != APP_ASSET_HOST) return null
        val requestPath = path ?: return null
        if (!requestPath.startsWith(APP_ASSET_ROOT)) return null

        val relativePath = requestPath.removePrefix("/assets/")
        return relativePath.takeIf {
            it.startsWith("web/") && !it.split('/').contains("..")
        }
    }

    private fun isTextAsset(path: String): Boolean = when (path.substringAfterLast('.', "")) {
        "html", "htm", "js", "mjs", "css", "json", "webmanifest", "svg", "txt" -> true
        else -> false
    }

    private fun mimeType(path: String): String = when (path.substringAfterLast('.', "")) {
        "html", "htm" -> "text/html"
        "js", "mjs" -> "text/javascript"
        "css" -> "text/css"
        "json" -> "application/json"
        "webmanifest" -> "application/manifest+json"
        "svg" -> "image/svg+xml"
        "png" -> "image/png"
        "jpg", "jpeg" -> "image/jpeg"
        "webp" -> "image/webp"
        "gif" -> "image/gif"
        "ico" -> "image/x-icon"
        "woff" -> "font/woff"
        "woff2" -> "font/woff2"
        else -> "application/octet-stream"
    }
}

private class BundledWebChromeClient : WebChromeClient() {
    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
        consoleMessage ?: return false
        Log.d(
            TAG,
            "${consoleMessage.messageLevel()}: ${consoleMessage.message()} " +
                "(${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})"
        )
        return true
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun HomePage() {
    val context = LocalContext.current
    val webView = remember(context) {
        WebView(context).apply {
            setBackgroundColor(Color.TRANSPARENT)
            webViewClient = BundledAssetWebViewClient(context)
            webChromeClient = BundledWebChromeClient()
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = false
            settings.allowContentAccess = false
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            settings.mediaPlaybackRequiresUserGesture = false
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            settings.cacheMode = WebSettings.LOAD_NO_CACHE
            settings.setSupportZoom(false)
            isFocusable = true
            isFocusableInTouchMode = true
            requestFocus()
            loadUrl(APP_START_URL)
        }
    }

    DisposableEffect(webView) {
        onDispose {
            webView.stopLoading()
            webView.webChromeClient = null
            webView.webViewClient = WebViewClient()
            webView.destroy()
        }
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { webView }
    )
}

package com.luluanan.looptictactoe.spatial.platform

import android.app.Application
import com.pico.spatial.ui.foundation.dsl.launch
import com.luluanan.looptictactoe.spatial.mainApp

class SpatialApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        launch(::mainApp)
    }
}

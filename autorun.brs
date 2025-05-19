function main()

	' Set PTP domain required for sync
    ptpReg = createobject("roregistrysection", "networking")
    ptp_domain = ptpReg.read("ptp_domain")
    if ptp_domain <> "0" then
        ptpReg.write("ptp_domain","0")
        ptpReg.flush()
        RebootSystem()	'reboots player first time it's changed
    end if	

	' TouchScreen configuration
    touchScreen = CreateObject("roTouchScreen")
	touchScreen.SetResolution(1920, 1080)
    touchScreen.EnableCursor(1)

	mp = CreateObject("roMessagePort") 
  'Enable lDWS
	enableLDWS()
  ' Enable SSH
	enableSSH()

	sleep(10000)

  ' Create HTML Widget
	widget = createHTMLWidget(mp)
	widget.Show()

  'Event Loop
	while true
		msg = wait(0,mp)
		print "msg received - type=";type(msg)

		if type(msg) = "roHtmlWidgetEvent" then
			print "msg: ";msg
		end if
	end while

end function

function createHTMLWidget(mp as object) as object
	' Enable Web Inspector
	reg = CreateObject("roRegistrySection","html")
	reg.Write("enable_web_inspector","1")
	reg.Flush()

  ' Get Screen Resolution
	vidmode = CreateObject("roVideoMode")
	vidmode.SetMode("1920x1080x60p")
	width = vidmode.GetResX()
	height = vidmode.GetResY()

	r = CreateObject("roRectangle",0,0,width,height)

	
  ' Create HTML Widget config
	config = {
		hwz_default: "on"
		mouse_enabled: true
		nodejs_enabled: true
		brightsign_js_objects_enabled: true
		inspector_server: {
			port: 3000
		}
		
		url: "file:///sd:/index.html"
		port: mp
	}
  
  ' Create HTML Widget
	h = CreateObject("roHtmlWidget",r,config)
	return h

end function

function enableLDWS()
	
	registrySection = CreateObject("roRegistrySection", "networking")
	
	if type(registrySection) = "roRegistrySection" then 

		registrySection.Write("http_server", "80")
	
	end if

	registrySection.Flush()

end function

function enableSSH()

	regSSH = CreateObject("roRegistrySection", "networking")
	
	if type(regSSH) = "roRegistrySection" then
		
		regSSH.Write("ssh","22")

	endif

	n = CreateObject("roNetworkConfiguration", 0)
	n.SetLoginPassword("password")
	n.Apply()

	regSSH.Flush()

end function
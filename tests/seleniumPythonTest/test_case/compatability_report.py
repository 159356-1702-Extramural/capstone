import os.path
import time

class Report:
    tempFile = "tests/seleniumPythonTest/reports/tempFile.html"
    liveFile = "tests/seleniumPythonTest/reports/compat.html"
    def __init__(self):
        self.currentOs = ""

    def startReport(self):
        global tempFile
        if(os.path.exists(self.tempFile)):
            os.remove(self.tempFile)
        f = open(self.tempFile, "w+")
        f.write("<html>\r\n\t<head>\r\n\t\t<title>Settlers of Massey Compatability Report</title>\r\n\t\t<style>table{border-collapse: collapse;} a:link{color:black;} td{border:1px solid grey;padding:0 5px;}.black{background-color:black;}.white{color:white;}.green{background-color:#afa;} .red{background-color:#faa;}</style>\r\n\t</head>\r\n")
        f.write("\t<body>\r\n\t<h1>Settlers of Massey: latest compatability tests.</h1>\r\n\t<h3>Started " + str(time.strftime("%d/%m/%Y")) + "</h3>\r\n\t\t<table>\r\n")

        f.close()

    def addEntry(self, osName, entryName, link, succeeded):
        global tempFile
        global liveFile
        f = open(self.tempFile, "a")
        if(osName != self.currentOs):
            f.write("\t\t\t<tr class='black'><td class='white'>"+osName+"</td></tr>")
            self.currentOs = osName

        successValue = "N"
        tdColor = "red"
        if succeeded:
            tdColor = "green"
            successValue = "Y"

        f.write("\t\t\t<tr>\r\n\t\t\t\t")
        f.write("<td>"+entryName+"</td><td class='" + tdColor + "'><a href='"+link+"'>"+successValue+"</a></td>")

        if(os.path.exists(self.liveFile)):
            with open(self.liveFile, 'r') as searchLiveFile:
                for line in searchLiveFile:
                    if entryName in line:
                        newLine = line.strip(' \t')
                        newLine = newLine.strip("<td>"+entryName+"</td>")
                        f.write("<td "+newLine+"</td>")

        f.write("\t\t\t</tr>\r\n")
        f.close()

    def endReport(self):
        f = open(self.tempFile, "a")
        f.write("\t\t</table>\r\n\t</body>\r\n</html>")
        f.close()

        if(os.path.exists(self.liveFile)):
            currentDate = str(time.strftime('%d-%m-%Y'))
            newPath = "tests/seleniumPythonTest/reports/oldTests-" + currentDate + ".html"
            os.rename(self.liveFile, newPath)
        os.rename(self.tempFile, self.liveFile)


r = Report()
r.startReport()
r.addEntry('Windows10', 'Firefox 10 | Windows 10', 'http://test', True)
r.addEntry('Windows10', 'Firefox 9 | Windows 10', 'http://test1', True)
r.addEntry('Windows8', 'Firefox 10 | Windows 8', 'http://test2', True)
r.endReport()
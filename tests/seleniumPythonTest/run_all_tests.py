__author__ = 'QSG'
import unittest
import HTMLTestRunner
import os,sys, time

# Directory for locating test cases
test_dir=os.path.split(os.path.realpath(sys.argv[0]))[0]
test_case_dir=test_dir+'\\test_case\\'
test_reports_dir=test_dir+'\\selenium_test_reports\\'
print test_reports_dir
def creatsuite():
    testunit=unittest.TestSuite()
    #Define discover selenium py test files to find py test cases.
    discover=unittest.defaultTestLoader.discover(test_dir,
                    pattern ='slnm_test*.py',
                    top_level_dir=None)

    #Add test cases to the test suits
    for test_suite in discover:
        # print test_suite,'\n'
        for test_case in test_suite:
            testunit.addTests(test_case)
            print testunit
    return testunit
alltestnames = creatsuite()
now = time.strftime('%m-%d-%Y-%H_%M_%S',time.localtime(time.time()))
#If selenium test reports dir is not exists, then create it.
if not os.path.isdir(test_reports_dir):
    os.mkdir(test_reports_dir)

filename = test_reports_dir+now+'result.html'
fp = file(filename, 'wb')
runner =HTMLTestRunner.HTMLTestRunner(
    stream=fp,
    title=u'Settler of Massey Selenium Test Report',
    description=u'Results of the tests:')

# runner=unittest.TextTestRunner(); #Run this line when only want to see result on screen.

#Running the test cases.
runner.run(alltestnames)
print "Selenium test finished."
